"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  format,
  startOfDay,
  endOfDay,
  areIntervalsOverlapping,
} from "date-fns";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimeSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  startTime: Date;
  endTime: Date;
  roomName?: string;
  onAddEvent?: (title: string, description?: string) => void;
  isEditMode?: boolean;
  initialTitle?: string;
  initialDescription?: string;
  isPreview?: boolean;
  existingEvents?: any[];
  currentEventId?: string | number;
  rooms?: { id: number; title: string }[];
  selectedRoomId?: number | null;
  onRoomChange?: (roomId: number) => void;
}

export default function TimeSlotDialog({
  isOpen,
  onClose,
  startTime,
  endTime,
  roomName,
  onAddEvent,
  isEditMode = false,
  initialTitle = "",
  initialDescription = "",
  isPreview = false,
  existingEvents = [],
  currentEventId,
  rooms = [],
  selectedRoomId = null,
  onRoomChange = () => {},
}: TimeSlotDialogProps) {
  const [start, setStart] = useState(format(startTime, "HH:mm"));
  const [end, setEnd] = useState(format(endTime, "HH:mm"));
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isFullDay, setIsFullDay] = useState(false);
  const [fullDayDisabled, setFullDayDisabled] = useState(false);
  const [conflictReason, setConflictReason] = useState("");

  // Check if full day booking is possible
  useEffect(() => {
    if (!existingEvents.length) {
      setFullDayDisabled(false);
      setConflictReason("");
      return;
    }

    const fullDayStart = startOfDay(startTime);
    const fullDayEnd = endOfDay(startTime);

    // Check for conflicts with existing events
    const conflicts = existingEvents.filter((event) => {
      // Skip the current event being edited
      if (currentEventId && event.id === currentEventId) return false;

      // Skip events with undefined start or end
      if (!event.start || !event.end) return false;

      return areIntervalsOverlapping(
        { start: fullDayStart, end: fullDayEnd },
        { start: event.start, end: event.end }
      );
    });

    if (conflicts.length > 0) {
      setFullDayDisabled(true);
      setConflictReason(
        "Cannot book full day due to existing events on this day"
      );
    } else {
      setFullDayDisabled(false);
      setConflictReason("");
    }
  }, [startTime, existingEvents, currentEventId]);

  // Handle full day checkbox change
  const handleFullDayChange = (checked: boolean) => {
    setIsFullDay(checked);
    if (checked) {
      // Set time to full day (00:00 to 23:59)
      setStart("00:00");
      setEnd("23:59");
    } else {
      // Reset to original times
      setStart(format(startTime, "HH:mm"));
      setEnd(format(endTime, "HH:mm"));
    }
  };

  // Create the actual event with the modified times if needed
  const handleCreateEvent = () => {
    onAddEvent?.(title, description);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isPreview
              ? "Event Details"
              : isEditMode
              ? "Edit Event"
              : "Schedule New Event"}
          </DialogTitle>
          <DialogDescription>
            {format(startTime, "PPPP")} from {format(startTime, "p")} to{" "}
            {format(endTime, "p")}
            {roomName && (
              <span className="block mt-2 font-medium text-primary">
                Location: {roomName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        {!isPreview && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium mb-1">
                Event Title*
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium mb-1">
                Description (optional)
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter event description"
              />
            </div>
            {rooms.length > 0 && (
              <div>
                <Label htmlFor="room" className="text-sm font-medium mb-1">
                  Room*
                </Label>
                <select
                  id="room"
                  value={selectedRoomId || ""}
                  onChange={(e) => onRoomChange(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    Select a room
                  </option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label htmlFor="start" className="text-sm font-medium mb-1">
                Start Time
              </Label>
              <Input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                disabled={isFullDay}
              />
            </div>
            <div>
              <Label htmlFor="end" className="text-sm font-medium mb-1">
                End Time
              </Label>
              <Input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                disabled={isFullDay}
              />
            </div>
            <div className="flex items-center space-x-2 ">
              <Checkbox
                id="fullDay"
                checked={isFullDay}
                onCheckedChange={handleFullDayChange}
                disabled={fullDayDisabled}
              />
              <Label htmlFor="fullDay" className="text-sm font-medium">
                Full day booking
              </Label>
              {fullDayDisabled && conflictReason && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{conflictReason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}
        {isPreview ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1">Event Title</Label>
              <p className="text-gray-700">{title}</p>
            </div>
            {description && (
              <div>
                <Label className="text-sm font-medium mb-1">Description</Label>
                <p className="text-gray-700">{description}</p>
              </div>
            )}
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isPreview ? "Close" : "Cancel"}
          </Button>
          {!isPreview && (
            <Button
              onClick={handleCreateEvent}
              disabled={!title.trim() || !selectedRoomId}
            >
              {isEditMode ? "Update Event" : "Create Event"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
