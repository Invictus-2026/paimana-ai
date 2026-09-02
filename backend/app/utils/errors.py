"""Error handling utilities and custom HTTP exceptions."""

from fastapi import HTTPException, status


class EntityNotFoundError(HTTPException):
    """Exception thrown when a requested resource is not found."""

    def __init__(self, entity_name: str, entity_id: int | str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity_name} with ID '{entity_id}' was not found.",
        )


class ServiceUnavailableError(HTTPException):
    """Exception thrown when an upstream ML service is unreachable."""

    def __init__(self, service_name: str):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service '{service_name}' is currently unavailable.",
        )
