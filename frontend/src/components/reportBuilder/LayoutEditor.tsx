// NOTE: You must install 'react-beautiful-dnd' for this component to work:
// npm install react-beautiful-dnd
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

const SECTION_TYPES = [
  { id: 'header', label: 'Header' },
  { id: 'footer', label: 'Footer' },
  { id: 'dataTable', label: 'Data Table' },
  { id: 'chart', label: 'Chart' },
  { id: 'custom', label: 'Custom Block' },
];

const getSectionComponent = (type: string) => {
  switch (type) {
    case 'header':
      return <div className="p-4 bg-blue-100 rounded">Header Section</div>;
    case 'footer':
      return <div className="p-4 bg-green-100 rounded">Footer Section</div>;
    case 'dataTable':
      return <div className="p-4 bg-yellow-100 rounded">Data Table Section</div>;
    case 'chart':
      return <div className="p-4 bg-purple-100 rounded">Chart Section</div>;
    case 'custom':
      return <div className="p-4 bg-gray-100 rounded">Custom Content Block</div>;
    default:
      return null;
  }
};

interface Section {
  id: string;
  type: string;
}

function DraggableSection({ section }: { section: Section }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? '#f0f8ff' : undefined,
    cursor: 'grab',
    marginBottom: '1rem',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {getSectionComponent(section.type)}
    </div>
  );
}

const LayoutEditor: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  // Add section from palette
  const handleAddSection = (type: string) => {
    setSections([...sections, { id: `${type}-${Date.now()}`, type }]);
  };

  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over?.id);
      setSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Section Palette */}
      <div className="w-1/5 bg-white border rounded p-4">
        <h2 className="font-bold mb-4">Section Palette</h2>
        <div>
          {SECTION_TYPES.map((section) => (
            <div
              key={section.id}
              className="mb-2 p-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300"
              onClick={() => handleAddSection(section.id)}
            >
              {section.label} <span className="text-xs text-gray-500">(Click to add)</span>
            </div>
          ))}
        </div>
      </div>
      {/* Canvas */}
      <div className="flex-1 bg-gray-50 border rounded p-4 min-h-[400px]">
        <h2 className="font-bold mb-4">Layout Canvas</h2>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {sections.length === 0 && <div className="text-gray-400">Click a section to add it here</div>}
            {sections.map((section) => (
              <DraggableSection key={section.id} section={section} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      {/* Preview Pane */}
      <div className="w-1/3 bg-white border rounded p-4">
        <h2 className="font-bold mb-4">Real-Time Preview</h2>
        <div className="bg-gray-100 p-4 rounded min-h-[400px]">
          {sections.map((section) => getSectionComponent(section.type))}
        </div>
      </div>
    </div>
  );
};

export default LayoutEditor; 