import { useState } from 'react';
import { useStore } from '../store/useStore';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { Download, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '../lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

export function Timetable() {
  const { subjects, timetable, addTimetableEntry, deleteTimetableEntry } = useStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.data.current?.type === 'subject') {
      const subjectId = active.id as string;
      const [dayStr, hourStr] = (over.id as string).split('-');
      const day = parseInt(dayStr);
      const hour = parseInt(hourStr);
      
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

      // Check if slot is already taken
      const existing = timetable.find(t => 
        t.day_of_week === day && 
        t.start_time <= startTime && 
        t.end_time > startTime
      );

      if (!existing) {
        addTimetableEntry({
          subject_id: subjectId,
          day_of_week: day,
          start_time: startTime,
          end_time: endTime,
        });
      }
    }
  };

  const exportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('timetable-grid');
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('timetable.pdf');
    }
    setIsExporting(false);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Timetable</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Drag subjects to schedule your week.</p>
          </div>
          <button
            onClick={exportPDF}
            disabled={isExporting}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl font-medium shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 shrink-0 space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-24">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                Subjects
              </h3>
              <div className="space-y-3">
                {subjects.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                    Add subjects first to create your timetable.
                  </p>
                ) : (
                  subjects.map(subject => (
                    <DraggableSubject key={subject.id} subject={subject} />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto pb-8">
            <div id="timetable-grid" className="min-w-[800px] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="grid grid-cols-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="p-4 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800">
                  Time
                </div>
                {DAYS.map((day, i) => (
                  <div key={day} className="p-4 text-center text-sm font-bold text-zinc-900 dark:text-white border-r border-zinc-200 dark:border-zinc-800 last:border-0">
                    {day}
                  </div>
                ))}
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {HOURS.map(hour => (
                  <div key={hour} className="grid grid-cols-8">
                    <div className="p-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {DAYS.map((_, dayIndex) => {
                      // Adjust dayIndex because DAYS array starts with Monday (0), but JS getDay() has Sunday as 0.
                      // Let's map Monday=1, Tuesday=2... Sunday=0 to match JS getDay()
                      const jsDay = dayIndex === 6 ? 0 : dayIndex + 1;
                      const slotId = `${jsDay}-${hour}`;
                      
                      const entry = timetable.find(t => 
                        t.day_of_week === jsDay && 
                        parseInt(t.start_time.split(':')[0]) === hour
                      );
                      
                      const subject = entry ? subjects.find(s => s.id === entry.subject_id) : null;

                      return (
                        <DroppableSlot 
                          key={slotId} 
                          id={slotId} 
                          entry={entry} 
                          subject={subject}
                          onDelete={() => entry && deleteTimetableEntry(entry.id)}
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
    </DndContext>
  );
}

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
      style={style}
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

function DroppableSlot({ id, entry, subject, onDelete }: { id: string, entry: any, subject: any, onDelete: () => void }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[60px] p-1 border-r border-zinc-200 dark:border-zinc-800 last:border-0 transition-colors relative group",
        isOver ? "bg-indigo-50 dark:bg-indigo-500/10" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
      )}
    >
      {entry && subject && (
        <div 
          className="w-full h-full rounded-lg p-2 text-xs font-bold text-white relative overflow-hidden flex flex-col justify-center"
          style={{ backgroundColor: subject.color }}
        >
          <span className="truncate block">{subject.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute top-1 right-1 p-1 bg-black/20 hover:bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
