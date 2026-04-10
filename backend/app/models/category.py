from pydantic import BaseModel


class CategoryModel(BaseModel):
    id: str
    name: str
    description: str = ""
