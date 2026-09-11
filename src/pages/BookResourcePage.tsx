import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Building,
  Sparkles,
  Presentation,
  Flame,
  CheckCircle2,
  HelpCircle,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import {
  ActivityType,
  CampusLocationCode,
  PermissionType,
  CampusRoom,
  Society,
  Booking,
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const BookResourcePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard Step (1 to 8)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 8;

  // Master Data from Storage
  const locations = storageService.getLocations();
  const allRooms = storageService.getRooms();
  const societies = storageService.getSocieties();

  // Form State
  const [activityType, setActivityType] = useState<ActivityType>('Workshop / Session');
  
  // Society selection
  const [societySearch, setSocietySearch] = useState('');
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>(
    user.societyId || 'soc-ieee'
  );

  // Location selection
  const [selectedLocationId, setSelectedLocationId] = useState<CampusLocationCode>('LT');

  // Room selection
  const [selectedRoomId, setSelectedRoomId] = useState<string>('LT-101');

  // Date and Time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState<string>(defaultDate);
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('17:00');

  // Permission selection
  const [permissionType, setPermissionType] = useState<PermissionType>('Morning Permission');

  // Activity Details (Contextual)
  // Society Prep
  const [prepPurpose, setPrepPurpose] = useState('');
  const [prepMemberCount, setPrepMemberCount] = useState<number>(25);
  const [prepRequirements, setPrepRequirements] = useState('');

  // Workshop
  const [workshopName, setWorkshopName] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [workshopParticipants, setWorkshopParticipants] = useState<number>(60);
  const [workshopEquipment, setWorkshopEquipment] = useState<string[]>([
    'Projector & Screen',
    'Wireless Mic',
  ]);
  const [workshopPurpose, setWorkshopPurpose] = useState('');

  // Event
  const [eventName, setEventName] = useState('');
  const [eventCoordinator, setEventCoordinator] = useState(user.name || '');
  const [eventAttendance, setEventAttendance] = useState<number>(150);
  const [setupRequirements, setSetupRequirements] = useState('');
  const [eventEquipment, setEventEquipment] = useState<string[]>([
    'Stage Lighting',
    'PA Audio System',
  ]);
  const [eventAdditionalReq, setEventAdditionalReq] = useState('');

  // Submission & Validation Feedback
  const [validationError, setValidationError] = useState<string>('');
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);

  // Derived filtered entities
  const filteredSocieties = useMemo(() => {
    if (!societySearch.trim()) return societies;
    return societies.filter(
      (s) =>
        s.name.toLowerCase().includes(societySearch.toLowerCase()) ||
        s.code.toLowerCase().includes(societySearch.toLowerCase())
    );
  }, [societies, societySearch]);

  const selectedSociety = societies.find((s) => s.id === selectedSocietyId) || societies[0];
  const selectedLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];
  const availableRoomsForLocation = allRooms.filter((r) => r.locationId === selectedLocationId);
  const selectedRoom =
    allRooms.find((r) => r.id === selectedRoomId) || availableRoomsForLocation[0] || allRooms[0];

  // Collision Check
  const availabilityCheck = useMemo(() => {
    if (!selectedRoomId || !bookingDate || !startTime || !endTime) {
      return { available: true };
    }
    return storageService.checkRoomAvailability(selectedRoomId, bookingDate, startTime, endTime);
  }, [selectedRoomId, bookingDate, startTime, endTime]);

  // Handle Equipment checkboxes
  const toggleEquipment = (
    item: string,
    currentList: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentList.includes(item)) {
      setter(currentList.filter((x) => x !== item));
    } else {
      setter([...currentList, item]);
    }
  };

  // Step Validation
  const validateCurrentStep = (): boolean => {
    setValidationError('');

    if (currentStep === 1 && !activityType) {
      setValidationError('Please select an activity type.');
      return false;
    }
    if (currentStep === 2 && !selectedSocietyId) {
      setValidationError('Please select an active society.');
      return false;
    }
    if (currentStep === 3 && !selectedLocationId) {
      setValidationError('Please select a campus location.');
      return false;
    }
    if (currentStep === 4 && !selectedRoomId) {
      setValidationError('Please select a room.');
      return false;
    }
    if (currentStep === 5) {
      if (!bookingDate) {
        setValidationError('Please select a booking date.');
        return false;
      }
      if (!startTime || !endTime) {
        setValidationError('Please select both start and end times.');
        return false;
      }
      if (startTime >= endTime) {
        setValidationError('End time must be later than start time.');
        return false;
      }
      if (!availabilityCheck.available) {
        setValidationError(
          `Conflict detected! This room is already reserved for "${availabilityCheck.conflictingBooking?.societyName}" during this time (${availabilityCheck.conflictingBooking?.startTime} - ${availabilityCheck.conflictingBooking?.endTime}). Please choose another time or room.`
        );
        return false;
      }
    }
    if (currentStep === 6 && !permissionType) {
      setValidationError('Please select Morning or Night permission.');
      return false;
    }
    if (currentStep === 7) {
      if (activityType === 'Society Preparation') {
        if (!prepPurpose.trim()) {
          setValidationError('Please specify the rehearsal / preparation purpose.');
          return false;
        }
        if (!prepMemberCount || prepMemberCount <= 0) {
          setValidationError('Please enter a valid member count.');
          return false;
        }
      } else if (activityType === 'Workshop / Session') {
        if (!workshopName.trim()) {
          setValidationError('Please enter the workshop/session name.');
          return false;
        }
        if (!speaker.trim()) {
          setValidationError('Please enter the speaker or trainer name.');
          return false;
        }
        if (!workshopPurpose.trim()) {
          setValidationError('Please state the purpose of the session.');
          return false;
        }
      } else if (activityType === 'Event') {
        if (!eventName.trim()) {
          setValidationError('Please enter the event name.');
          return false;
        }
        if (!eventCoordinator.trim()) {
          setValidationError('Please specify the event coordinator.');
          return false;
        }
        if (!setupRequirements.trim()) {
          setValidationError('Please outline the setup requirements.');
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setValidationError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submission handler
  const handleSubmitBooking = () => {
    let detailsPayload: any = {};
    let purposeText = '';
    let participants = 0;

    if (activityType === 'Society Preparation') {
      detailsPayload = {
        purpose: prepPurpose,
        memberCount: prepMemberCount,
        additionalRequirements: prepRequirements,
      };
      purposeText = prepPurpose;
      participants = prepMemberCount;
    } else if (activityType === 'Workshop / Session') {
      detailsPayload = {
        workshopName,
        speaker,
        expectedParticipants: workshopParticipants,
        equipmentRequired: workshopEquipment,
        purpose: workshopPurpose,
      };
      purposeText = workshopPurpose;
      participants = workshopParticipants;
    } else {
      detailsPayload = {
        eventName,
        coordinator: eventCoordinator,
        expectedAttendance: eventAttendance,
        setupRequirements,
        equipmentRequired: eventEquipment,
        additionalRequirements: eventAdditionalReq,
      };
      purposeText = `Event: ${eventName} - ${setupRequirements.slice(0, 80)}`;
      participants = eventAttendance;
    }

    const newBooking = storageService.addBooking({
      societyId: selectedSociety.id,
      societyName: selectedSociety.name,
      activityType,
      locationId: selectedLocation.id,
      locationName: selectedLocation.name,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      date: bookingDate,
      startTime,
      endTime,
      permissionType,
      purpose: purposeText,
      participantCount: participants,
      details: detailsPayload,
      submittedBy: user.id,
      submittedByName: user.name,
    });

    setSubmittedBooking(newBooking);
  };

  const stepsList = [
    { num: 1, title: 'Activity' },
    { num: 2, title: 'Society' },
    { num: 3, title: 'Location' },
    { num: 4, title: 'Room' },
    { num: 5, title: 'Time Slot' },
    { num: 6, title: 'Permission' },
    { num: 7, title: 'Details' },
    { num: 8, title: 'Review' },
  ];

  // Success Confirmation Screen
  if (submittedBooking) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 uppercase tracking-wider mb-2">
            Reference #{submittedBooking.id}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Booking Request Submitted!
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Your request is now <strong className="text-amber-600">Pending Approval</strong> by the Permission In-charge. You can monitor the approval status from your dashboard.
          </p>
        </div>

        {/* Quick Summary Ticket */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left space-y-3 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 text-xs">
            <span className="text-slate-500">Status</span>
            <StatusBadge status="Pending" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Society:</span>
              <p className="font-semibold text-slate-900">{submittedBooking.societyName}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Venue:</span>
              <p className="font-semibold text-slate-900">{submittedBooking.roomName}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Date & Time:</span>
              <p className="font-semibold text-slate-900">
                {submittedBooking.date} ({submittedBooking.startTime} - {submittedBooking.endTime})
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Permission:</span>
              <p className="font-semibold text-slate-900">{submittedBooking.permissionType}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/student/bookings')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs transition-colors"
          >
            View in My Bookings
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmittedBooking(null);
              setCurrentStep(1);
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Book Another Resource
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Book a Campus Resource
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Follow the 8-step structured workflow to request lecture halls, amphitheatres, or auditoriums.
        </p>
      </div>

      {/* Progress Wizard Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
        <div className="hidden sm:flex items-center justify-between">
          {stepsList.map((step, idx) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-600 font-extrabold'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : step.num}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-medium ${
                      isCurrent ? 'text-blue-700 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      currentStep > idx + 1 ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Step Header */}
        <div className="sm:hidden flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
              {currentStep}
            </span>
            <span className="text-xs font-bold text-slate-900">
              Step {currentStep} of {totalSteps}: {stepsList[currentStep - 1]?.title}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-medium">{validationError}</span>
        </div>
      )}

      {/* Step Content Containers */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs min-h-[380px]">
        {/* STEP 1: Activity Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 1 — Select Activity Type</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the primary nature of the campus reservation to adapt the required permissions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Option 1: Society Preparation */}
              <div
                onClick={() => setActivityType('Society Preparation')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all text-left flex flex-col justify-between ${
                  activityType === 'Society Preparation'
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mb-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Society Preparation</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Internal society dry-runs, stage rehearsals, choreography practices, or team core council meetings.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Fast Track Review</span>
                  {activityType === 'Society Preparation' && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Option 2: Workshop / Session */}
              <div
                onClick={() => setActivityType('Workshop / Session')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all text-left flex flex-col justify-between ${
                  activityType === 'Workshop / Session'
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 mb-4">
                    <Presentation className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Workshop / Session</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Technical bootcamps, guest lectures, expert talks, hands-on lab training, or hackathons.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>AV Setup Included</span>
                  {activityType === 'Workshop / Session' && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Option 3: Event */}
              <div
                onClick={() => setActivityType('Event')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all text-left flex flex-col justify-between ${
                  activityType === 'Event'
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700 mb-4">
                    <Flame className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Campus Event</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Large-scale symposiums, competitive fest finals, theatrical plays, concerts, or summits.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Dean Clearance Required</span>
                  {activityType === 'Event' && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Select Society */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 2 — Select Society</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the registered student chapter or university society organizing this activity.
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search society by name or code (e.g., IEEE, TDS, CSI)..."
                value={societySearch}
                onChange={(e) => setSocietySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 max-h-80 overflow-y-auto pr-1">
              {filteredSocieties.map((soc) => (
                <div
                  key={soc.id}
                  onClick={() => setSelectedSocietyId(soc.id)}
                  className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left flex items-start justify-between ${
                    selectedSocietyId === soc.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{soc.code}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {soc.category}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 mt-1">{soc.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Lead: {soc.leadName}</p>
                  </div>
                  {selectedSocietyId === soc.id && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Select Location */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 3 — Select Campus Location</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All 12 designated university facilities and academic blocks.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocationId(loc.id);
                    // auto pick first room of this location
                    const matchedRooms = allRooms.filter((r) => r.locationId === loc.id);
                    if (matchedRooms.length > 0) {
                      setSelectedRoomId(matchedRooms[0].id);
                    }
                  }}
                  className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left ${
                    selectedLocationId === loc.id
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-900">{loc.id}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{loc.category}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{loc.name}</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{loc.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Select Room / Resource */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Step 4 — Select Room in {selectedLocation.name} ({selectedLocation.id})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an available hall or studio. Availability flags update dynamically.
                </p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {availableRoomsForLocation.length} room(s) listed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {availableRoomsForLocation.map((room) => {
                const isSelected = selectedRoomId === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{room.name}</span>
                        <StatusBadge status={room.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          Capacity: {room.capacity}
                        </span>
                        {room.floor && <span>• {room.floor}</span>}
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {room.facilities.map((fac, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">ID: {room.id}</span>
                      {isSelected && (
                        <span className="font-bold text-blue-600 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Selected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Date and Time */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 5 — Date and Time Slot</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Room: <strong className="text-slate-800">{selectedRoom.name}</strong> ({selectedLocation.id})
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Booking Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  End Time <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Live Availability & Conflict Callout Indicator */}
            <div className="pt-2">
              {availabilityCheck.available ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      🟢 Available for the selected time
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      No conflicting reservations found for {selectedRoom.name} on {bookingDate} between {startTime} and {endTime}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-rose-900">
                      🔴 This room is already booked during this time
                    </p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Reserved by <strong>{availabilityCheck.conflictingBooking?.societyName}</strong> ({availabilityCheck.conflictingBooking?.startTime} - {availabilityCheck.conflictingBooking?.endTime}).
                      Please adjust the time slot or choose another hall.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: Permission */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 6 — Permission Category</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Campus security protocol differentiates daytime activity from late evening access.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Morning Permission */}
              <div
                onClick={() => setPermissionType('Morning Permission')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all text-left flex flex-col justify-between ${
                  permissionType === 'Morning Permission'
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 mb-3">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Morning Permission</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Standard academic daytime reservation (08:00 AM to 08:00 PM). Regular building access with standard key issuance.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-semibold">
                  <span>Standard Daytime Clearance</span>
                  {permissionType === 'Morning Permission' && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Night Permission */}
              <div
                onClick={() => setPermissionType('Night Permission')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all text-left flex flex-col justify-between ${
                  permissionType === 'Night Permission'
                    ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 mb-3">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Night Permission</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Late evening access (post 08:00 PM). Requires specific faculty advisor endorsement and night campus security notification.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-semibold">
                  <span>Security & Gate Pass Included</span>
                  {permissionType === 'Night Permission' && (
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Contextual Activity Details */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 7 — Activity Details</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic fields tailored specifically for <strong className="text-blue-700">{activityType}</strong>.
              </p>
            </div>

            {/* FORM A: Society Preparation */}
            {activityType === 'Society Preparation' && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Purpose of Preparation / Rehearsal <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={prepPurpose}
                    onChange={(e) => setPrepPurpose(e.target.value)}
                    placeholder="e.g., Tech fest dramatics stage blocking, dance sync practice, or robot telemetry testing..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Number of Members <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={prepMemberCount}
                    onChange={(e) => setPrepMemberCount(Number(e.target.value))}
                    min={1}
                    max={selectedRoom.capacity}
                    className="w-full sm:w-48 rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 ml-2">
                    (Venue limit: {selectedRoom.capacity} attendees)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Additional Requirements (Optional)
                  </label>
                  <input
                    type="text"
                    value={prepRequirements}
                    onChange={(e) => setPrepRequirements(e.target.value)}
                    placeholder="e.g., Floor clearance, mirrored wall access, extra chairs..."
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* FORM B: Workshop / Session */}
            {activityType === 'Workshop / Session' && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Workshop / Session Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={workshopName}
                      onChange={(e) => setWorkshopName(e.target.value)}
                      placeholder="e.g., Hands-on Quantum Computing Masterclass"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Speaker / Trainer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={speaker}
                      onChange={(e) => setSpeaker(e.target.value)}
                      placeholder="e.g., Dr. Arvind Sharma (Senior Scientist)"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Expected Participants <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={workshopParticipants}
                    onChange={(e) => setWorkshopParticipants(Number(e.target.value))}
                    min={5}
                    max={selectedRoom.capacity}
                    className="w-full sm:w-48 rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 ml-2">
                    (Max venue capacity: {selectedRoom.capacity})
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Equipment Required
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Projector & Screen',
                      'Wireless Mic',
                      'High-Speed Wi-Fi',
                      'Digital Whiteboard',
                      'Extension Boards',
                      'Live Stream Camera',
                    ].map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs cursor-pointer hover:bg-slate-100"
                      >
                        <input
                          type="checkbox"
                          checked={workshopEquipment.includes(item)}
                          onChange={() =>
                            toggleEquipment(item, workshopEquipment, setWorkshopEquipment)
                          }
                          className="h-3.5 w-3.5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700 font-medium">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Purpose / Objectives <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={workshopPurpose}
                    onChange={(e) => setWorkshopPurpose(e.target.value)}
                    placeholder="Briefly state syllabus/goals covered in this academic session..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* FORM C: Event */}
            {activityType === 'Event' && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Event Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="e.g., Annual Inter-University Cultural Gala 2026"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Event Coordinator <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eventCoordinator}
                      onChange={(e) => setEventCoordinator(e.target.value)}
                      placeholder="Full Name of Faculty or Lead Coordinator"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Expected Attendance <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={eventAttendance}
                    onChange={(e) => setEventAttendance(Number(e.target.value))}
                    min={10}
                    max={selectedRoom.capacity}
                    className="w-full sm:w-48 rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 ml-2">
                    (Max room capacity: {selectedRoom.capacity})
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Setup Requirements <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={setupRequirements}
                    onChange={(e) => setSetupRequirements(e.target.value)}
                    placeholder="e.g., Registration canopy outside, stage risers, podium banner, guest seating..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Equipment Required
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Stage Lighting',
                      'PA Audio System',
                      'LED Wall / Display',
                      'VIP Green Room Access',
                      'Crowd Control Barricades',
                      'Campus Security Marshals',
                    ].map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs cursor-pointer hover:bg-slate-100"
                      >
                        <input
                          type="checkbox"
                          checked={eventEquipment.includes(item)}
                          onChange={() =>
                            toggleEquipment(item, eventEquipment, setEventEquipment)
                          }
                          className="h-3.5 w-3.5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700 font-medium">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Additional Requirements (Optional)
                  </label>
                  <input
                    type="text"
                    value={eventAdditionalReq}
                    onChange={(e) => setEventAdditionalReq(e.target.value)}
                    placeholder="e.g., Gate vehicle entry passes, catering clearance..."
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 8: Booking Summary */}
        {currentStep === 8 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 8 — Booking Summary Review</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify all details below prior to transmitting the request to the Permission In-charge.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 divide-y divide-slate-200 text-xs space-y-4">
              {/* Top Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    Society
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedSociety.name}</p>
                  <p className="text-slate-500 text-[11px]">Code: {selectedSociety.code}</p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    Activity Type
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{activityType}</p>
                  <p className="text-slate-500 text-[11px]">
                    Applicant: {user.name} ({user.email})
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    Permission Type
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{permissionType}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">
                    {permissionType === 'Night Permission' ? 'Requires Security Pass' : 'Daytime Permit'}
                  </span>
                </div>
              </div>

              {/* Location & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 pb-2">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    Campus Location
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedLocation.name}</p>
                  <p className="text-slate-500 text-[11px]">Zone ID: {selectedLocation.id}</p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    Room / Resource
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedRoom.name}</p>
                  <p className="text-slate-500 text-[11px]">Max Capacity: {selectedRoom.capacity}</p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    Date & Time
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{bookingDate}</p>
                  <p className="text-slate-700 font-semibold text-xs mt-0.5">
                    {startTime} to {endTime}
                  </p>
                </div>
              </div>

              {/* Activity Specific Summary */}
              <div className="pt-3 space-y-2">
                <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  Submitted Activity Specifications
                </span>

                {activityType === 'Society Preparation' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                    <p>
                      <span className="font-semibold text-slate-700">Purpose:</span> {prepPurpose}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Members Attending:</span>{' '}
                      {prepMemberCount}
                    </p>
                    {prepRequirements && (
                      <p>
                        <span className="font-semibold text-slate-700">Additional Needs:</span>{' '}
                        {prepRequirements}
                      </p>
                    )}
                  </div>
                )}

                {activityType === 'Workshop / Session' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                    <p>
                      <span className="font-semibold text-slate-700">Workshop Title:</span>{' '}
                      {workshopName}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Speaker/Trainer:</span>{' '}
                      {speaker}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Expected Participants:</span>{' '}
                      {workshopParticipants}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Equipment:</span>{' '}
                      {workshopEquipment.join(', ') || 'None'}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Purpose:</span>{' '}
                      {workshopPurpose}
                    </p>
                  </div>
                )}

                {activityType === 'Event' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                    <p>
                      <span className="font-semibold text-slate-700">Event Title:</span> {eventName}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Coordinator:</span>{' '}
                      {eventCoordinator}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Attendance:</span>{' '}
                      {eventAttendance}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Setup:</span>{' '}
                      {setupRequirements}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Equipment:</span>{' '}
                      {eventEquipment.join(', ') || 'None'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons (Back & Next / Submit) */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
            currentStep === 1
              ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs transition-colors"
          >
            Continue to {stepsList[currentStep]?.title || 'Next'}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitBooking}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            Submit Booking Request
          </button>
        )}
      </div>
    </div>
  );
};
