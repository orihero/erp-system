import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FieldConfig } from '../../types/fieldConfig';

interface FieldOrderDnDProps {
  fields: FieldConfig[];
  onOrderChange: (newFields: FieldConfig[]) => void;
  onFormat?: (field: FieldConfig) => void;
}

function DraggableRow({ field, onFormat }: { field: FieldConfig; onFormat?: (field: FieldConfig) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.metadata.name });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? '#f0f8ff' : undefined,
    cursor: 'grab',
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <td>::</td>
      <td>
        <input type="checkbox" checked={field.selected} readOnly />
      </td>
      <td>{field.metadata.name}</td>
      <td>{field.metadata.label}</td>
      <td>{field.metadata.type}</td>
      <td>{field.metadata.description}</td>
      <td>{String(field.metadata.sampleValue)}</td>
      <td>
        {field.metadata.usageStats
          ? `Count: ${field.metadata.usageStats.count}, Distinct: ${field.metadata.usageStats.distinct}`
          : '-'}
      </td>
      <td>{field.metadata.group}</td>
      <td>{field.metadata.category}</td>
      <td>{field.order}</td>
      <td>
        <button onClick={() => onFormat && onFormat(field)}>Format</button>
      </td>
    </tr>
  );
}

const FieldOrderDnD: React.FC<FieldOrderDnDProps> = ({ fields, onOrderChange, onFormat }) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const fieldIds = fields.slice().sort((a, b) => a.order - b.order).map(f => f.metadata.name);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fieldIds.indexOf(active.id as string);
      const newIndex = fieldIds.indexOf(over?.id as string);
      const sortedFields = fields.slice().sort((a, b) => a.order - b.order);
      const newFields = arrayMove(sortedFields, oldIndex, newIndex).map((f, idx) => ({ ...f, order: idx }));
      onOrderChange(newFields);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
        <tbody>
          {fields
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <DraggableRow key={field.metadata.name} field={field} onFormat={onFormat} />
            ))}
        </tbody>
      </SortableContext>
    </DndContext>
  );
};

export default FieldOrderDnD; 