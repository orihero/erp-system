import React, { useState } from 'react';
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

export interface Field {
  id: string;
  name: string;
  type: string;
  description: string;
  sample: string | number | null;
  usage: number;
}

interface FieldListProps {
  fields: Field[];
  onSelect: (id: string) => void;
  selectedFieldId: string | null;
  onReorder?: (fields: Field[]) => void;
}

const SortableRow: React.FC<{
  field: Field;
  selected: boolean;
  onClick: () => void;
}> = ({ field, selected, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: selected ? '#e6f7ff' : isDragging ? '#fafafa' : undefined,
    cursor: 'grab',
  };
  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
      <td style={{ width: 24, textAlign: 'center', cursor: 'grab' }}>☰</td>
      <td>{field.name}</td>
      <td>{field.type}</td>
      <td>{field.description}</td>
      <td>{field.sample !== null ? String(field.sample) : ''}</td>
      <td>{field.usage}</td>
    </tr>
  );
};

const FieldList: React.FC<FieldListProps> = ({ fields, onSelect, selectedFieldId, onReorder }) => {
  const [search, setSearch] = useState('');
  const [fieldOrder, setFieldOrder] = useState(fields.map(f => f.id));

  // Keep fieldOrder in sync with fields prop
  React.useEffect(() => {
    setFieldOrder(fields.map(f => f.id));
  }, [fields]);

  // Filtered fields (basic search)
  const filteredFields = fields.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );
  // Order fields according to fieldOrder
  const orderedFields = fieldOrder
    .map(id => filteredFields.find(f => f.id === id))
    .filter((f): f is Field => !!f);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fieldOrder.indexOf(active.id as string);
      const newIndex = fieldOrder.indexOf(over.id as string);
      const newOrder = arrayMove(fieldOrder, oldIndex, newIndex);
      setFieldOrder(newOrder);
      if (onReorder) {
        // Reorder the fields array and call onReorder
        const newFields = newOrder
          .map(id => fields.find(f => f.id === id))
          .filter((f): f is Field => !!f);
        onReorder(newFields);
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Search fields..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: 4 }}
        />
      </div>
      {/* TODO: Add filter and grouping controls */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: 24 }}></th>
                <th>Name</th>
                <th>Type</th>
                <th>Description</th>
                <th>Sample</th>
                <th>Usage</th>
                {/* TODO: Add bulk select checkbox */}
              </tr>
            </thead>
            <tbody>
              {orderedFields.map(field => (
                <SortableRow
                  key={field.id}
                  field={field}
                  selected={field.id === selectedFieldId}
                  onClick={() => onSelect(field.id)}
                />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
      {/* TODO: Add bulk actions, grouping UI */}
    </div>
  );
};

export default FieldList; 