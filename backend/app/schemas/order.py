from pydantic import BaseModel, ConfigDict, Field


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)


class CheckoutAddress(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    full_name: str = Field(min_length=2)
    line1: str = Field(min_length=3)
    line2: str = ""
    city: str = Field(min_length=2)
    state: str = Field(min_length=2)
    postal_code: str = Field(min_length=4, max_length=12)
    country: str = Field(min_length=2)
    phone: str = Field(min_length=8, max_length=20)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    shipping_address: CheckoutAddress
    payment_method: str = Field(min_length=3)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    product_id: str
    name: str
    quantity: int
    unit_price: float
    total_price: float


class StatusEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    status: str
    message: str
    timestamp: str


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    invoice_number: str
    user_id: str
    status: str
    items: list[OrderItemResponse]
    shipping_address: CheckoutAddress
    payment_status: str
    payment_method: str
    payment_reference: str
    total_amount: float
    created_at: str
    status_history: list[StatusEventResponse]


class OrderStatusUpdate(BaseModel):
    status: str
    message: str = Field(min_length=2)


class InvoiceResponse(BaseModel):
    order_id: str
    invoice_number: str
    content: str
