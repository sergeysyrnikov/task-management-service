"""Task routes."""

from typing import Annotated
from uuid import UUID

from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, Response, status

from app.application.services.task_service import TaskService
from app.core.di.containers import Container
from app.interfaces.api.dependencies import verify_api_key
from app.interfaces.api.schemas.tasks import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"], dependencies=[Depends(verify_api_key)])


@router.get("", response_model=list[TaskResponse])
@inject
async def list_tasks(
    service: Annotated[TaskService, Depends(Provide[Container.task_service])],
) -> list[TaskResponse]:
    tasks = await service.list_tasks()
    return [TaskResponse.model_validate(t, from_attributes=True) for t in tasks]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
@inject
async def create_task(
    payload: TaskCreate,
    service: Annotated[TaskService, Depends(Provide[Container.task_service])],
) -> TaskResponse:
    task = await service.create_task(payload.title)
    return TaskResponse.model_validate(task, from_attributes=True)


@router.patch("/{task_id}", response_model=TaskResponse)
@inject
async def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    service: Annotated[TaskService, Depends(Provide[Container.task_service])],
) -> TaskResponse:
    task = await service.update_task(task_id, title=payload.title, completed=payload.completed)
    return TaskResponse.model_validate(task, from_attributes=True)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
@inject
async def delete_task(
    task_id: UUID,
    service: Annotated[TaskService, Depends(Provide[Container.task_service])],
) -> Response:
    await service.delete_task(task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
