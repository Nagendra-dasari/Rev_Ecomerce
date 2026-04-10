from pydantic import BaseModel, Field


class OrderItemModel(BaseModel):
    product_id: str
    name: str
    quantity: int
    unit_price: float
    total_price: float


class OrderAddressModel(BaseModel):
    full_name: str
    line1: str
    line2: str = ""
    city: str
    state: str
    postal_code: str
    country: str
    phone: str


class StatusEventModel(BaseModel):
    status: str
    message: str
    timestamp: str


class OrderModel(BaseModel):
    id: str
    invoice_number: str
    user_id: str
    status: str
    items: list[OrderItemModel]
    shipping_address: OrderAddressModel
    payment_status: str
    payment_method: str
    payment_reference: str
    total_amount: float
    created_at: str
    status_history: list[StatusEventModel] = Field(default_factory=list)
