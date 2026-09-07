from beanie import Document


class Room(Document):
    name: str
    type: str  # "classroom" | "lab" | "seminar_hall" | "ground"
    capacity: int
    status: str = "available"  # free-text status surfaced to Room Availability UI

    class Settings:
        name = "rooms"
