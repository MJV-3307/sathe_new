"""
Timetable generation and conflict-detection engine.

Deliberately framework-free (no FastAPI / MongoDB imports) so it can be
unit-tested in isolation and reused from routes, seed scripts, or a CLI.
Routes/services adapt Beanie documents into the dataclasses below and back.
"""
from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from typing import Optional


def _stable_offset(key: str, modulus: int) -> int:
    """Deterministic replacement for hash(key) % modulus. Python's built-in
    hash() is salted per-process (PYTHONHASHSEED) for security reasons, so
    using it here made timetable generation non-reproducible between runs —
    the same inputs could place classes in different slots each time. That
    breaks the spec's "reproducible demo" expectation and made this exact
    test suite flaky. md5 is used purely as a stable integer digest, not
    for anything security-sensitive."""
    digest = hashlib.md5(key.encode("utf-8")).hexdigest()
    return int(digest, 16) % modulus


# ---------------------------------------------------------------------------
# Domain objects
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Slot:
    """One (day, period) cell in the week grid. day: 0=Mon..4=Fri."""
    day: int
    period: int

    def __str__(self) -> str:
        return f"D{self.day}P{self.period}"


@dataclass
class FacultyInfo:
    id: str
    name: str
    department: str
    subject_ids: set[str]                 # subjects this faculty can teach
    unavailable: set[Slot] = field(default_factory=set)
    max_classes_per_day: int = 6


@dataclass
class RoomInfo:
    id: str
    name: str
    type: str          # "classroom" | "lab" | "seminar_hall" | "ground"
    capacity: int


@dataclass
class SubjectRequirement:
    id: str
    name: str
    department: str
    semester: str
    faculty_id: str
    hours_per_week: int
    requires_lab: bool = False
    student_count: int = 0


@dataclass(frozen=True)
class Entry:
    day: int
    period: int
    subject_id: str
    faculty_id: str
    room_id: str
    semester: str

    @property
    def slot(self) -> Slot:
        return Slot(self.day, self.period)


class ConflictError(Exception):
    """Raised when an operation would put the timetable into an invalid state."""
    def __init__(self, reasons: list[str]):
        self.reasons = reasons
        super().__init__("; ".join(reasons))


class GenerationError(Exception):
    """Raised when a complete, conflict-free timetable cannot be generated."""
    def __init__(self, reasons: list[str], partial_entries: list[Entry]):
        self.reasons = reasons
        self.partial_entries = partial_entries
        super().__init__("Timetable could not be generated because: " + "; ".join(reasons))


# ---------------------------------------------------------------------------
# Conflict detection — the hard constraints from the spec (section 9)
# ---------------------------------------------------------------------------

def conflicts_for_candidate(
    entries: list[Entry],
    candidate: Entry,
    faculty_map: dict[str, FacultyInfo],
    room_map: dict[str, RoomInfo],
    subject_map: dict[str, SubjectRequirement],
    ignore_entry: Optional[Entry] = None,
) -> list[str]:
    """Return a list of human-readable conflict reasons for inserting/moving
    `candidate` into `entries`. Empty list == safe to apply."""
    reasons: list[str] = []
    others = [e for e in entries if e != ignore_entry]

    faculty = faculty_map.get(candidate.faculty_id)
    room = room_map.get(candidate.room_id)
    subject = subject_map.get(candidate.subject_id)

    if faculty is None:
        reasons.append(f"Unknown faculty '{candidate.faculty_id}'")
    if room is None:
        reasons.append(f"Unknown room '{candidate.room_id}'")
    if subject is None:
        reasons.append(f"Unknown subject '{candidate.subject_id}'")
    if reasons:
        return reasons  # can't check further without valid refs

    # 1. Faculty cannot teach two classes at the same time.
    for e in others:
        if e.slot == candidate.slot and e.faculty_id == candidate.faculty_id:
            reasons.append(
                f"Faculty conflict: {faculty.name} is already teaching "
                f"{e.subject_id} at {candidate.slot}"
            )

    # 2/3. A room/lab cannot contain two classes at the same time.
    for e in others:
        if e.slot == candidate.slot and e.room_id == candidate.room_id:
            reasons.append(
                f"Room conflict: {room.name} is already booked for "
                f"{e.subject_id} at {candidate.slot}"
            )

    # 5. Faculty unavailable slots cannot be used.
    if candidate.slot in faculty.unavailable:
        reasons.append(f"{faculty.name} is marked unavailable at {candidate.slot}")

    # 6. Lab subjects must be assigned to suitable labs.
    if subject.requires_lab and room.type != "lab":
        reasons.append(f"{subject.name} requires a lab; {room.name} is a {room.type}")

    # 7. Classroom capacity must be sufficient.
    if subject.student_count and room.capacity < subject.student_count:
        reasons.append(
            f"{room.name} capacity {room.capacity} is below the "
            f"{subject.student_count} students in {subject.name}"
        )

    # 8. A class cannot overlap with another class for the same semester.
    for e in others:
        if e.slot == candidate.slot and e.semester == candidate.semester:
            reasons.append(
                f"Semester conflict: {candidate.semester} already has "
                f"{e.subject_id} scheduled at {candidate.slot}"
            )

    # Faculty daily load cap (soft-ish hard cap, keeps generation sane)
    same_day_count = sum(
        1 for e in others
        if e.faculty_id == candidate.faculty_id and e.day == candidate.day
    )
    if same_day_count >= faculty.max_classes_per_day:
        reasons.append(
            f"{faculty.name} would exceed max {faculty.max_classes_per_day} "
            f"classes/day on day {candidate.day}"
        )

    return reasons


def validate_timetable(
    entries: list[Entry],
    faculty_map: dict[str, FacultyInfo],
    room_map: dict[str, RoomInfo],
    subject_map: dict[str, SubjectRequirement],
) -> list[str]:
    """Full-timetable validation used as the gate before publishing.
    Re-checks every entry against every other entry (cheap at prototype scale)."""
    all_reasons: list[str] = []
    for e in entries:
        reasons = conflicts_for_candidate(
            entries, e, faculty_map, room_map, subject_map, ignore_entry=e
        )
        all_reasons.extend(reasons)

    # 4. Required weekly subject hours must be satisfied.
    for subj in subject_map.values():
        placed = sum(1 for e in entries if e.subject_id == subj.id)
        if placed < subj.hours_per_week:
            all_reasons.append(
                f"{subj.name} ({subj.semester}) has {placed}/{subj.hours_per_week} "
                f"hours scheduled"
            )

    # de-duplicate while preserving order
    seen = set()
    deduped = []
    for r in all_reasons:
        if r not in seen:
            seen.add(r)
            deduped.append(r)
    return deduped


# ---------------------------------------------------------------------------
# Generation — greedy placement with slot rotation to spread load
# ---------------------------------------------------------------------------

def generate_timetable(
    subjects: list[SubjectRequirement],
    faculty_map: dict[str, FacultyInfo],
    room_map: dict[str, RoomInfo],
    days: int = 6,
    periods_per_day: int = 9,
    break_periods: Optional[set[int]] = None,
) -> list[Entry]:
    """Generate a complete timetable using deterministic CSP backtracking.

    The old implementation was greedy: once it placed an early subject it
    never reconsidered that decision. A perfectly feasible timetable could
    therefore fail simply because an early subject consumed a useful slot.
    This version treats every required weekly hour as a scheduling task,
    chooses the most constrained task first, and backtracks when a later task
    becomes impossible. Candidate ordering is deterministic for reproducible
    results.
    """
    break_periods = break_periods or set()
    if days < 1 or periods_per_day < 1:
        raise GenerationError(["The timetable must contain at least one day and one period per day"], [])

    # Normalize and validate inputs before searching.
    subject_map = {s.id: s for s in subjects}
    all_slots = [
        Slot(d, p)
        for d in range(days)
        for p in range(1, periods_per_day + 1)
        if p not in break_periods
    ]
    if not all_slots:
        raise GenerationError(["No usable timetable slots remain after applying breaks"], [])

    reasons: list[str] = []
    for subject in subjects:
        if subject.hours_per_week < 1:
            reasons.append(f"{subject.name}: hours_per_week must be at least 1")
        if subject.faculty_id not in faculty_map:
            reasons.append(f"{subject.name}: assigned faculty '{subject.faculty_id}' does not exist")
        if not any(
            ((r.type.lower() == "lab") == subject.requires_lab)
            and r.capacity >= max(0, subject.student_count)
            for r in room_map.values()
        ):
            reasons.append(f"{subject.name}: no room of the required type/capacity exists")
    total_hours = sum(max(0, s.hours_per_week) for s in subjects)
    if total_hours > len(all_slots):
        reasons.append(
            f"The semester requires {total_hours} class-hours/week but only "
            f"{len(all_slots)} usable slots exist"
        )
    if reasons:
        raise GenerationError(reasons, [])

    # One task per weekly class hour. We keep the task index so a subject can
    # never be placed twice in the same slot.
    tasks = [(s.id, i) for s in subjects for i in range(s.hours_per_week)]
    entries: list[Entry] = []

    # Fast occupancy indexes make the search substantially cheaper than
    # repeatedly scanning the whole entry list.
    faculty_slots: dict[str, set[Slot]] = {fid: set() for fid in faculty_map}
    faculty_day_load: dict[tuple[str, int], int] = {}
    room_slots: dict[str, set[Slot]] = {rid: set() for rid in room_map}
    semester_slots: dict[str, set[Slot]] = {}
    subject_slots: dict[str, set[Slot]] = {sid: set() for sid in subject_map}

    def candidate_entries(subject: SubjectRequirement, task_index: int) -> list[Entry]:
        faculty = faculty_map[subject.faculty_id]
        rooms = [
            r for r in room_map.values()
            if (r.type.lower() == "lab") == subject.requires_lab
            and r.capacity >= max(0, subject.student_count)
        ]
        candidates: list[Entry] = []
        # Stable rotation prevents every run from clustering at Monday P1
        # while still allowing the search to consider every slot.
        offset = _stable_offset(f"{subject.id}:{task_index}", len(all_slots))
        rotated = all_slots[offset:] + all_slots[:offset]
        for slot in rotated:
            if slot in faculty.unavailable:
                continue
            if slot in faculty_slots[faculty.id]:
                continue
            if slot in subject_slots[subject.id]:
                continue
            if semester_slots.setdefault(subject.semester, set()) and slot in semester_slots[subject.semester]:
                continue
            if faculty_day_load.get((faculty.id, slot.day), 0) >= faculty.max_classes_per_day:
                continue
            for room in rooms:
                if slot in room_slots[room.id]:
                    continue
                candidates.append(Entry(
                    day=slot.day,
                    period=slot.period,
                    subject_id=subject.id,
                    faculty_id=subject.faculty_id,
                    room_id=room.id,
                    semester=subject.semester,
                ))
        # Prefer less-loaded days and avoid stacking the same subject back to
        # back when alternatives exist. These are soft preferences only.
        candidates.sort(key=lambda e: (
            faculty_day_load.get((e.faculty_id, e.day), 0),
            len(subject_slots[e.subject_id]),
            e.day,
            e.period,
            e.room_id,
        ))
        return candidates

    # Re-select the next task dynamically (MRV). Tasks already scheduled are
    # removed from this list; the task with the fewest legal choices goes next.
    remaining = list(tasks)
    nodes = 0
    max_nodes = max(100_000, len(tasks) * 20_000)

    def place() -> bool:
        nonlocal nodes
        nodes += 1
        if not remaining:
            return True
        if nodes > max_nodes:
            return False

        best_pos = -1
        best_candidates: list[Entry] | None = None
        for pos, (sid, task_index) in enumerate(remaining):
            candidates = candidate_entries(subject_map[sid], task_index)
            if not candidates:
                return False
            if best_candidates is None or len(candidates) < len(best_candidates):
                best_pos, best_candidates = pos, candidates
                if len(candidates) == 1:
                    break

        sid, task_index = remaining.pop(best_pos)
        for candidate in best_candidates or []:
            entries.append(candidate)
            faculty_slots[candidate.faculty_id].add(candidate.slot)
            faculty_day_load[(candidate.faculty_id, candidate.day)] = faculty_day_load.get((candidate.faculty_id, candidate.day), 0) + 1
            room_slots[candidate.room_id].add(candidate.slot)
            semester_slots.setdefault(candidate.semester, set()).add(candidate.slot)
            subject_slots[candidate.subject_id].add(candidate.slot)

            if place():
                return True

            entries.pop()
            faculty_slots[candidate.faculty_id].remove(candidate.slot)
            key = (candidate.faculty_id, candidate.day)
            faculty_day_load[key] -= 1
            if faculty_day_load[key] == 0:
                del faculty_day_load[key]
            room_slots[candidate.room_id].remove(candidate.slot)
            semester_slots[candidate.semester].remove(candidate.slot)
            subject_slots[candidate.subject_id].remove(candidate.slot)

        remaining.insert(best_pos, (sid, task_index))
        return False

    if not place():
        # Return useful diagnostics instead of silently persisting a partial
        # schedule. Re-run the first unresolved task to identify its blockers.
        diagnostics = []
        for sid, task_index in remaining[:5]:
            subject = subject_map[sid]
            diagnostics.append(
                f"{subject.name} ({subject.semester}): no complete placement was found "
                f"for its required {subject.hours_per_week} hours/week; "
                "the solver exhausted feasible combinations of faculty, rooms and slots"
            )
        if nodes > max_nodes:
            diagnostics.append(f"Solver search limit reached after {nodes:,} combinations")
        raise GenerationError(diagnostics or ["No conflict-free timetable could be found"], entries)

    # Final safety gate: the engine must never return an invalid schedule.
    validation = validate_timetable(entries, faculty_map, room_map, subject_map)
    if validation:
        raise GenerationError(validation, entries)
    return entries


def move_entry(
    entries: list[Entry],
    target: Entry,
    new_day: int,
    new_period: int,
    new_room_id: Optional[str],
    new_faculty_id: Optional[str],
    faculty_map: dict[str, FacultyInfo],
    room_map: dict[str, RoomInfo],
    subject_map: dict[str, SubjectRequirement],
) -> list[Entry]:
    """Manual timetable edit (drag/move a class). Raises ConflictError and
    leaves `entries` untouched if the move is invalid."""
    if target not in entries:
        raise ConflictError(["Entry not found in timetable"])

    candidate = Entry(
        day=new_day,
        period=new_period,
        subject_id=target.subject_id,
        faculty_id=new_faculty_id or target.faculty_id,
        room_id=new_room_id or target.room_id,
        semester=target.semester,
    )
    reasons = conflicts_for_candidate(
        entries, candidate, faculty_map, room_map, subject_map, ignore_entry=target
    )
    if reasons:
        raise ConflictError(reasons)

    new_entries = [e for e in entries if e != target]
    new_entries.append(candidate)
    return new_entries


def publish(
    entries: list[Entry],
    faculty_map: dict[str, FacultyInfo],
    room_map: dict[str, RoomInfo],
    subject_map: dict[str, SubjectRequirement],
) -> None:
    """Gate used by the /publish endpoint. Raises ConflictError (with every
    reason, not just the first) if the timetable is not publishable."""
    reasons = validate_timetable(entries, faculty_map, room_map, subject_map)
    if reasons:
        raise ConflictError(reasons)
