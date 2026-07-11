import { useState } from 'react';
import { useStore } from '../store/useStore';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { Trash2, Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 5); // 5 AM to 10 PM (5:00 to 22:00)

export function Timetable() {
  const { subjects, timetable, addTimetableEntry, deleteTimetableEntry, updateTimetableEntry } = useStore();
  const [activeEntry, setActiveEntry] = useState<{ day: number, hour: number, entry?: any } | null>(null);
  const [view, setView] = useState<'day' | 'week'>('week');
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // For Day view

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const [dayStr, hourStr] = (over.id as string).split('-');
    const day = parseInt(dayStr);
    const hour = parseInt(hourStr);
    
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    // Check if slot is already taken
    const existing = timetable.find(t => 
      t.day_of_week === day && 
      parseInt(t.start_time.split(':')[0]) === hour
    );

    if (active.data.current?.type === 'subject') {
      if (existing) return;
      const subjectId = active.id as string;
      addTimetableEntry({
        subject_id: subjectId,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
      });
    } else if (active.data.current?.type === 'entry') {
      if (existing && existing.id !== active.id) return; // Cannot move to an occupied slot
      
      updateTimetableEntry(active.id as string, {
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
      });
    }
  };

  const visibleDays = view === 'week' ? DAYS : [DAYS[currentDayIndex]];

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Timetable</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your weekly study sessions.</p>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setView('day')}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", view === 'day' ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-600 dark:text-zinc-400")}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", view === 'week' ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-600 dark:text-zinc-400")}
            >
              Week
            </button>
          </div>
        </header>

        {view === 'day' && (
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setCurrentDayIndex(prev => (prev - 1 + 7) % 7)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"><ChevronLeft className="w-5 h-5"/></button>
            <span className="font-bold text-lg">{DAYS[currentDayIndex]}</span>
            <button onClick={() => setCurrentDayIndex(prev => (prev + 1) % 7)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"><ChevronRight className="w-5 h-5"/></button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 shrink-0 space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-24">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                Subjects
              </h3>
              <div className="space-y-3">
                {subjects.map(subject => <DraggableSubject key={subject.id} subject={subject} />)}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto pb-8">
            <div className="min-w-[600px] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className={cn("grid border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50", view === 'week' ? "grid-cols-8" : "grid-cols-2")}>
                <div className="p-4 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800">Time</div>
                {visibleDays.map((day) => (
                  <div key={day} className="p-4 text-center text-sm font-bold text-zinc-900 dark:text-white border-r border-zinc-200 dark:border-zinc-800 last:border-0">
                    {day}
                  </div>
                ))}
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {HOURS.map(hour => (
                  <div key={hour} className={cn("grid", view === 'week' ? "grid-cols-8" : "grid-cols-2")}>
                    <div className="p-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {visibleDays.map((day) => {
                      const dayIndex = DAYS.indexOf(day);
                      const jsDay = dayIndex === 6 ? 0 : dayIndex + 1;
                      const slotId = `${jsDay}-${hour}`;
                      const entry = timetable.find(t => t.day_of_week === jsDay && parseInt(t.start_time.split(':')[0]) === hour);
                      const subject = entry ? subjects.find(s => s.id === entry.subject_id) : null;

                      return (
                        <DroppableSlot 
                          key={slotId} id={slotId} entry={entry} subject={subject}
                          onDelete={() => entry && deleteTimetableEntry(entry.id)}
                          onClick={() => setActiveEntry({ day: jsDay, hour, entry })}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {activeEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
              {activeEntry.entry ? 'Edit Entry' : 'Select Subject'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Start Time</label>
                  <input 
                    type="time" 
                    defaultValue={activeEntry.entry?.start_time || `${activeEntry.hour.toString().padStart(2, '0')}:00`}
                    onChange={(e) => setActiveEntry(prev => prev ? {...prev, entry: {...prev.entry, start_time: e.target.value}} : null)}
                    className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">End Time</label>
                  <input 
                    type="time" 
                    defaultValue={activeEntry.entry?.end_time || `${(activeEntry.hour + 1).toString().padStart(2, '0')}:00`}
                    onChange={(e) => setActiveEntry(prev => prev ? {...prev, entry: {...prev.entry, end_time: e.target.value}} : null)}
                    className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {subjects.length === 0 ? (
                  <p className="text-sm text-zinc-500">No subjects available. Add them in the Subjects tab.</p>
                ) : (
                  subjects.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => setActiveEntry(prev => prev ? {...prev, entry: {...prev.entry, subject_id: subject.id}} : null)}
                      className={cn(
                        "w-full p-3 rounded-xl text-left text-sm font-medium text-white transition-opacity hover:opacity-90",
                        (activeEntry.entry?.subject_id === subject.id || (!activeEntry.entry && subject.id === subjects[0]?.id)) && "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900"
                      )}
                      style={{ backgroundColor: subject.color }}
                    >
                      {subject.name}
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setActiveEntry(null)}
                className="flex-1 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeEntry.entry) {
                    updateTimetableEntry(activeEntry.entry.id, {
                      subject_id: activeEntry.entry.subject_id || activeEntry.entry.subject_id,
                      start_time: activeEntry.entry.start_time,
                      end_time: activeEntry.entry.end_time,
                    });
                  } else {
                    addTimetableEntry({
                      subject_id: activeEntry.entry?.subject_id || subjects[0]?.id,
                      day_of_week: activeEntry.day,
                      start_time: activeEntry.entry?.start_time || `${activeEntry.hour.toString().padStart(2, '0')}:00`,
                      end_time: activeEntry.entry?.end_time || `${(activeEntry.hour + 1).toString().padStart(2, '0')}:00`,
                    });
                  }
                  setActiveEntry(null);
                }}
                className="flex-1 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}

// ... (rest of the file as viewed above)

// Components DraggableSubject and DroppableSlot
function DraggableSubject({ subject }: { subject: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: subject.id,
    data: { type: 'subject' }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3 rounded-xl text-sm font-bold text-white cursor-grab active:cursor-grabbing transition-shadow",
        isDragging ? "shadow-xl opacity-90" : "shadow-sm hover:shadow-md"
      )}
      style={{ ...style, backgroundColor: subject.color }}
    >
      {subject.name}
    </div>
  );
}

function DroppableSlot({ id, entry, subject, onDelete, onClick }: { id: string, entry: any, subject: any, onDelete: () => void, onClick: () => void }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      onClick={!entry ? onClick : undefined}
      className={cn(
        "min-h-[60px] p-1 border-r border-zinc-200 dark:border-zinc-800 last:border-0 transition-colors relative group",
        isOver ? "bg-indigo-50 dark:bg-indigo-500/10" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30",
        !entry && "cursor-pointer"
      )}
    >
      {!entry && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="w-4 h-4 text-zinc-400" />
        </div>
      )}
      {entry && subject && (
        <DraggableEntry entry={entry} subject={subject} onDelete={onDelete} />
      )}
    </div>
  );
}

function DraggableEntry({ entry, subject, onDelete }: { entry: any, subject: any, onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entry.id,
    data: { type: 'entry', entry }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "w-full h-full rounded-lg p-2 text-xs font-bold text-white relative overflow-hidden flex flex-col justify-center cursor-grab active:cursor-grabbing",
        isDragging ? "shadow-xl opacity-50" : "shadow-sm hover:shadow-md"
      )}
      style={{ ...style, backgroundColor: subject.color }}
    >
      <span className="truncate block">{subject.name}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1 right-1 p-1 bg-black/20 hover:bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

