from beanie import Document


class Subject(Document):
    name: str
    department: str
    semester: str
    faculty_id: str
    hours_per_week: int
    requires_lab: bool = False
    student_count: int = 0

    class Settings:
        name = "subjects"
