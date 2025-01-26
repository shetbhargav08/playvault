// ==========================================
// Global Variables
// ==========================================
let selectedTimeSlots = new Set();  // Selected time slots
let selectedPeriod = null;          // Selected period (e.g., Morning, Evening)
let selectedDate = null;            // Selected date
let crossMidnightDate = null;       // Date to handle cross-midnight scenarios
let bookedSlots = new Map();        // Map to track booked slots by date
let bulkBlockMode = false;          // Flag for bulk block mode

// ==========================================
// Initialize Everything
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeTimeSelection();
    initializeSportsSelection();
    initializeDatePicker();
    initializeButtons();
    initializeBulkActions();
    initializeTimeDropdowns();
    setInterval(disablePastSlots, 60000);
});

// Time slots configuration for each period
const periodTimeSlots = {
    'Night': generateTimeSlots(0, 5),     // 12:00 AM to 5:30 AM
    'Morning': generateTimeSlots(6, 11),   // 6:00 AM to 11:30 AM
    'Noon': generateTimeSlots(12, 17),     // 12:00 PM to 5:30 PM
    'Evening': generateTimeSlots(18, 23)   // 6:00 PM to 11:30 PM
};

// Flat array of all time slots for checking consecutive slots
const allTimeSlotsInOrder = [
    ...generateTimeSlots(0, 5),   // Night
    ...generateTimeSlots(6, 11),  // Morning
    ...generateTimeSlots(12, 17), // Noon
    ...generateTimeSlots(18, 23)  // Evening
];

function initializeSportsSelection() {
    const sportButtons = document.querySelectorAll('[data-type="sport"]');
    
    sportButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Set active class for clicked sport
            sportButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ==========================================
// Helper Functions
// ==========================================
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function getDateString(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function generateTimeSlots(startHour, endHour) {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const startTime = new Date(2000, 0, 1, hour, minute);
            const endTime = new Date(startTime.getTime() + 30 * 60000);
            const timeSlot = `${formatTime(startTime)} - ${formatTime(endTime)}`;
            slots.push(timeSlot);
        }
    }
    return slots;
}

function generateDropdownTimeSlots() {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = new Date(2000, 0, 1, hour, minute);
            slots.push({
                display: formatTime(time),
                value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            });
        }
    }
    return slots;
}

function timeToMinutes(timeRange) {
    // For 24-hour format
    if (timeRange.match(/^\d{2}:\d{2}$/)) {
        const [hours, minutes] = timeRange.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    // For 12-hour format
    const startTime = timeRange.split('-')[0].trim();
    const timeMatch = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return 0;

    let [_, hours, minutes, period] = timeMatch;
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (period.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
    }

    return hours * 60 + minutes;
}

// ==========================================
// Date Selection and Calendar
// ==========================================
function initializeDatePicker() {
    const dateButton = document.getElementById('dateButton');
    const calendarPopup = document.getElementById('calendarPopup');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    
    let currentDate = new Date();
    dateButton.textContent = "Select Date";
    
    dateButton.addEventListener('click', function(e) {
        e.stopPropagation();
        currentDate = new Date();
        calendarPopup.style.display = calendarPopup.style.display === 'block' ? 'none' : 'block';
        renderCalendar(currentDate);
    });

    document.addEventListener('click', function(e) {
        if (!calendarPopup.contains(e.target) && e.target !== dateButton) {
            calendarPopup.style.display = 'none';
        }
    });

    prevMonth.addEventListener('click', function() {
        if (currentDate.getMonth() === 0) return;
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonth.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });
}

function renderCalendar(date) {
    const currentMonth = document.getElementById('currentMonth');
    const calendarDates = document.getElementById('calendarDates');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    currentMonth.textContent = `${months[date.getMonth()]} ${date.getFullYear()}`;
    
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    
    calendarDates.innerHTML = '';
    
    for (let i = 0; i < firstDay.getDay(); i++) {
        calendarDates.appendChild(document.createElement('div'));
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dateCell = document.createElement('div');
        const cellDate = new Date(date.getFullYear(), date.getMonth(), i);
        dateCell.className = 'calendar-date';
        dateCell.textContent = i;
        
        if (cellDate < today || cellDate > maxDate) {
            dateCell.classList.add('disabled');
        } else {
            dateCell.addEventListener('click', function() {
                selectedDate = new Date(date.getFullYear(), date.getMonth(), i);
                const formattedDate = `${i} ${months[date.getMonth()]} ${date.getFullYear()}`;
                document.getElementById('dateButton').textContent = formattedDate;
                document.getElementById('calendarPopup').style.display = 'none';
                document.getElementById('dateButton').classList.add('selected');
                refreshTimeSlots();
            });
        }
        calendarDates.appendChild(dateCell);
    }
}

// ==========================================
// Period and Time Slot Selection
// ==========================================
function initializeTimeSelection() {
    const periodButtons = document.querySelectorAll('.period-button');
    
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.dataset.period;
            periodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedPeriod = period;
            createTimeSlots(period);
        });
    });
}

function createTimeSlots(period) {
    if (!selectedDate) return;
    
    const slotButtonsContainer = document.querySelector('.slot-buttons');
    slotButtonsContainer.innerHTML = '';

    const slots = periodTimeSlots[period];
    if (!slots) return;

    const dateString = getDateString(selectedDate);
    const bookedSlotsForDate = bookedSlots.get(dateString) || new Set();

    slots.forEach(time => {
        const button = document.createElement('button');
        button.className = 'slot-button';
        button.setAttribute('data-time', time);
        button.setAttribute('data-period', period);
        button.textContent = time;
        
        if (bookedSlotsForDate.has(time)) {
            button.classList.add('booked');
        } else if (selectedTimeSlots.has(time)) {
            button.classList.add('active');
        }
        
        button.addEventListener('click', () => toggleTimeSlot(button, time));
        slotButtonsContainer.appendChild(button);
    });

    disablePastSlots();
}

function toggleTimeSlot(button, time) {
    if (button.classList.contains('disabled')) {
        return;
    }

    if (button.classList.contains('booked')) {
        if (selectedTimeSlots.has(time)) {
            button.classList.remove('active', 'selected-for-cancellation');
            selectedTimeSlots.delete(time);
        } else {
            button.classList.add('active', 'selected-for-cancellation');
            selectedTimeSlots.add(time);
        }
    } else {
        if (selectedTimeSlots.has(time)) {
            if (canDeselectTimeSlot(time)) {
                button.classList.remove('active');
                selectedTimeSlots.delete(time);
            } else {
                alert('You can only deselect slots from either end of your selection');
                return;
            }
        } else {
            if (canSelectTimeSlot(time)) {
                button.classList.add('active');
                selectedTimeSlots.add(time);
            } else {
                alert('Please select consecutive time slots');
                return;
            }
        }
    }
    
    updateActionButtons();
}

function canSelectTimeSlot(newTime) {
    if (selectedTimeSlots.size === 0) return true;
    
    const newTimeIndex = allTimeSlotsInOrder.indexOf(newTime);
    const selectedIndices = Array.from(selectedTimeSlots).map(time => 
        allTimeSlotsInOrder.indexOf(time));
    
    if (selectedTimeSlots.size === 1) {
        const existingTimeIndex = selectedIndices[0];
        return Math.abs(newTimeIndex - existingTimeIndex) === 1;
    }
    
    const minIndex = Math.min(...selectedIndices);
    const maxIndex = Math.max(...selectedIndices);
    
    return newTimeIndex === minIndex - 1 || newTimeIndex === maxIndex + 1;
}

function canDeselectTimeSlot(time) {
    if (selectedTimeSlots.size <= 1) return true;
    
    const timeIndex = allTimeSlotsInOrder.indexOf(time);
    const selectedIndices = Array.from(selectedTimeSlots).map(t => 
        allTimeSlotsInOrder.indexOf(t));
    const minIndex = Math.min(...selectedIndices);
    const maxIndex = Math.max(...selectedIndices);
    
    return timeIndex === minIndex || timeIndex === maxIndex;
}

function disablePastSlots() {
    if (!selectedDate) return;

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);
    
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const allTimeSlots = document.querySelectorAll('.slot-button');
    
    allTimeSlots.forEach(slot => {
        const slotTime = slot.dataset.time;
        const slotMinutes = timeToMinutes(slotTime);
        
        if (selectedDay.getTime() === today.getTime()) {
            if (slotMinutes <= currentTime) {
                slot.classList.add('disabled');
            } else {
                slot.classList.remove('disabled');
            }
        }
        else if (selectedDay < today) {
            slot.classList.add('disabled');
        }
        else {
            slot.classList.remove('disabled');
        }
    });
}

// ==========================================
// Custom Dropdown for Period Selection
// ==========================================
class CustomDropdown {
    constructor(element) {
        this.dropdown = element;
        this.selected = this.dropdown.querySelector('.dropdown-selected');
        this.options = this.dropdown.querySelector('.dropdown-options');
        this.selectedText = this.dropdown.querySelector('.selected-text');
        this.changeHandlers = [];
        
        this.initialize();
    }

    initialize() {
        this.selected.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasActive = this.dropdown.classList.contains('active');
            
            document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
            
            if (!wasActive) {
                this.dropdown.classList.add('active');
            }
        });

        const optionElements = this.options.querySelectorAll('.dropdown-option');
        optionElements.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                const text = option.textContent;
                
                this.selectedText.textContent = text;
                this.selected.dataset.value = value;
                this.dropdown.classList.remove('active');
                
                // Trigger all registered change handlers
                this.changeHandlers.forEach(handler => handler(value, text));
            });
        });

        document.addEventListener('click', () => {
            this.dropdown.classList.remove('active');
        });
    }

    getValue() {
        return this.selected.dataset.value;
    }

    setValue(value) {
        const option = this.options.querySelector(`.dropdown-option[data-value="${value}"]`);
        if (option) {
            this.selectedText.textContent = option.textContent;
            this.selected.dataset.value = value;
        }
    }

    onChange(handler) {
        if (typeof handler === 'function') {
            this.changeHandlers.push(handler);
        }
    }
}

// ==========================================
// Time Range Selection and Dropdowns
// ==========================================
function initializeTimeDropdowns() {
    const startDropdown = document.getElementById('startTimeDropdown');
    const endDropdown = document.getElementById('endTimeDropdown');
    const startButton = startDropdown.querySelector('.dropdown-toggle');
    const endButton = endDropdown.querySelector('.dropdown-toggle');
    const startMenu = startDropdown.querySelector('.dropdown-menu');
    const endMenu = endDropdown.querySelector('.dropdown-menu');

    const timeSlots = generateDropdownTimeSlots();
    
    [startMenu, endMenu].forEach(menu => {
        timeSlots.forEach(timeSlot => {
            const option = document.createElement('div');
            option.className = 'time-option';
            option.textContent = timeSlot.display;
            option.setAttribute('data-value', timeSlot.value);
            menu.appendChild(option);
        });
    });

    [startButton, endButton].forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = button.nextElementSibling;
            const isOpen = menu.classList.contains('show');
            
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                m.classList.remove('show');
            });

            if (!isOpen) {
                menu.classList.add('show');
            }
        });
    });

    [startMenu, endMenu].forEach(menu => {
        menu.addEventListener('click', (e) => {
            if (e.target.classList.contains('time-option')) {
                const button = menu.previousElementSibling;
                button.textContent = e.target.textContent;
                button.setAttribute('data-value', e.target.getAttribute('data-value'));
                menu.classList.remove('show');
                validateTimeSelection();
            }
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    });
}

function validateTimeSelection() {
    const startButton = document.querySelector('#startTimeDropdown .dropdown-toggle');
    const endButton = document.querySelector('#endTimeDropdown .dropdown-toggle');
    const startValue = startButton.getAttribute('data-value');
    const endValue = endButton.getAttribute('data-value');
    
    if (startValue && endValue) {
        const startMinutes = timeToMinutes(startValue);
        const endMinutes = timeToMinutes(endValue);
        
        if (endMinutes <= startMinutes) {
            alert('End time must be after start time');
            endButton.textContent = '12:00 AM';
            endButton.setAttribute('data-value', '00:00');
        }
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.time-dropdown-content').forEach(dropdown => {
        dropdown.style.display = 'none';
    });
}

// ==========================================
// Bulk Time Range Blocking
// ==========================================
function initializeBulkActions() {
    const bulkTimeRange = document.getElementById('bulkTimeRange');
    const confirmBulkBlock = document.getElementById('confirmBulkBlock');
    const cancelBulkBlock = document.getElementById('cancelBulkBlock');
    const bulkPeriodDropdown = new CustomDropdown(document.getElementById('bulkPeriod'));

    if (!bulkTimeRange || !confirmBulkBlock || !cancelBulkBlock) {
        console.error('Required elements not found');
        return;
    }

    // Show time range when period is selected
    bulkPeriodDropdown.onChange((value) => {
        if (value) {
            bulkTimeRange.classList.remove('hidden');
        } else {
            bulkTimeRange.classList.add('hidden');
        }
    });

    confirmBulkBlock.addEventListener('click', () => {
        const startButton = document.querySelector('#startTimeDropdown .dropdown-toggle');
        const endButton = document.querySelector('#endTimeDropdown .dropdown-toggle');
        const startTime = startButton?.getAttribute('data-value');
        const endTime = endButton?.getAttribute('data-value');
        const bulkPeriod = bulkPeriodDropdown.getValue();

        if (!startTime || !endTime || !selectedDate) {
            alert('Please select start time, end time, and date');
            return;
        }

        applyBulkBooking(startTime, endTime, bulkPeriod);
    });

    // Modified cancel button to handle flexible unblocking
    cancelBulkBlock.addEventListener('click', () => {
        const startButton = document.querySelector('#startTimeDropdown .dropdown-toggle');
        const endButton = document.querySelector('#endTimeDropdown .dropdown-toggle');
        const startTime = startButton?.getAttribute('data-value');
        const endTime = endButton?.getAttribute('data-value');
        const bulkPeriod = bulkPeriodDropdown.getValue();

        if (!startTime || !endTime || !selectedDate) {
            alert('Please select start time, end time, and date');
            return;
        }

        applyFlexibleUnblocking(startTime, endTime, bulkPeriod);
    });
}

function applyFlexibleUnblocking(startTime, endTime, period) {
    const dates = getDateRangeForPeriod(selectedDate, period);
    let unblockingOccurred = false;
    
    dates.forEach(date => {
        const dateString = getDateString(date);
        if (bookedSlots.has(dateString)) {
            const bookedSlotsForDate = bookedSlots.get(dateString);
            const slotsToUnblock = getTimeSlotsBetween(startTime, endTime);
            
            slotsToUnblock.forEach(slot => {
                if (bookedSlotsForDate.has(slot)) {
                    bookedSlotsForDate.delete(slot);
                    unblockingOccurred = true;
                }
            });

            // Clean up empty dates
            if (bookedSlotsForDate.size === 0) {
                bookedSlots.delete(dateString);
            }
        }
    });

    // Provide feedback about the unblocking operation
    if (unblockingOccurred) {
        const periodText = {
            daily: 'selected day',
            weekly: 'selected week',
            monthly: 'selected month'
        }[period];
        alert(`Time slots have been unblocked for the ${periodText}`);
    } else {
        alert('No blocked slots found in the selected range');
    }

    refreshTimeSlots();
    saveBookingsToStorage(); // If you're using persistent storage
}


function getDateRangeForPeriod(startDate, period) {
    const dates = [new Date(startDate)];
    const endDate = new Date(startDate);
    
    switch (period) {
        case 'weekly':
            endDate.setDate(endDate.getDate() + 6);
            break;
        case 'monthly':
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(endDate.getDate() - 1);
            break;
        default: // daily
            return dates;
    }

    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 1);

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

function getTimeSlotsBetween(startTime, endTime) {
    const slots = [];
    let currentTime = new Date(`2000-01-01T${startTime}`);
    const endDateTime = new Date(`2000-01-01T${endTime}`);

    while (currentTime < endDateTime) {
        const nextTime = new Date(currentTime.getTime() + 30 * 60000);
        slots.push(`${formatTime(currentTime)} - ${formatTime(nextTime)}`);
        currentTime = nextTime;
    }

    return slots;
}

function applyBulkBooking(startTime, endTime, period) {
    const dates = getDateRangeForPeriod(selectedDate, period);
    let bookingOccurred = false;

    dates.forEach(date => {
        const dateString = getDateString(date);
        if (!bookedSlots.has(dateString)) {
            bookedSlots.set(dateString, new Set());
        }
        const bookedSlotsForDate = bookedSlots.get(dateString);
        const slotsToBook = getTimeSlotsBetween(startTime, endTime);
        
        slotsToBook.forEach(slot => {
            if (!bookedSlotsForDate.has(slot)) {
                bookedSlotsForDate.add(slot);
                bookingOccurred = true;
            }
        });
    });
    
    // Provide feedback about the bulk booking operation
    if (bookingOccurred) {
        const periodText = {
            daily: 'selected day',
            weekly: 'selected week',
            monthly: 'selected month'
        }[period];
        alert(`Time slots have been successfully booked for the ${periodText}`);
    } else {
        alert('No available slots to book in the selected range');
    }
    
    refreshTimeSlots();
    saveBookingsToStorage(); // If you're using persistent storage
}


// ==========================================
// Booking and Cancellation
// ==========================================
function initializeButtons() {
    const bookBtn = document.getElementById('bookBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            if (!selectedDate || selectedTimeSlots.size === 0) {
                alert('Please select a date and at least one time slot');
                return;
            }

            const dateString = getDateString(selectedDate);
            if (!bookedSlots.has(dateString)) {
                bookedSlots.set(dateString, new Set());
            }

            const bookedSlotsForDate = bookedSlots.get(dateString);
            selectedTimeSlots.forEach(slot => {
                bookedSlotsForDate.add(slot);
                const button = document.querySelector(`[data-time="${slot}"]`);
                if (button) {
                    button.classList.remove('active');
                    button.classList.add('booked');
                }
            });

            selectedTimeSlots.clear();
            updateActionButtons();
            alert('Slots booked successfully!');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (!selectedDate || selectedTimeSlots.size === 0) {
                alert('Please select booked slots to cancel');
                return;
            }

            const dateString = getDateString(selectedDate);
            const bookedSlotsForDate = bookedSlots.get(dateString);
            
            if (bookedSlotsForDate) {
                selectedTimeSlots.forEach(slot => {
                    bookedSlotsForDate.delete(slot);
                    const button = document.querySelector(`[data-time="${slot}"]`);
                    if (button) {
                        button.classList.remove('active', 'booked');
                    }
                });
            }

            selectedTimeSlots.clear();
            updateActionButtons();
            alert('Selected bookings have been cancelled!');
        });
    }
}

function updateActionButtons() {
    const bookBtn = document.getElementById('bookBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (!selectedTimeSlots.size) {
        bookBtn.classList.remove('active-action');
        cancelBtn.classList.remove('active-action');
        bookBtn.disabled = false;
        cancelBtn.disabled = false;
        return;
    }

    const dateString = getDateString(selectedDate);
    const bookedSlotsForDate = bookedSlots.get(dateString) || new Set();
    
    let hasBookableSlots = false;
    let hasCancellableSlots = false;

    selectedTimeSlots.forEach(slot => {
        if (bookedSlotsForDate.has(slot)) {
            hasCancellableSlots = true;
        } else {
            hasBookableSlots = true;
        }
    });

    if (hasBookableSlots) {
        bookBtn.classList.add('active-action');
        cancelBtn.classList.remove('active-action');
        bookBtn.disabled = false;
        cancelBtn.disabled = true;
    } else if (hasCancellableSlots) {
        cancelBtn.classList.add('active-action');
        bookBtn.classList.remove('active-action');
        cancelBtn.disabled = false;
        bookBtn.disabled = true;
    }
}

function refreshTimeSlots() {
    if (selectedPeriod) {
        createTimeSlots(selectedPeriod);
    }
}

function isSlotBooked(time) {
    if (!selectedDate) return false;
    const dateString = getDateString(selectedDate);
    const bookedSlotsForDate = bookedSlots.get(dateString);
    return bookedSlotsForDate && bookedSlotsForDate.has(time);
}

