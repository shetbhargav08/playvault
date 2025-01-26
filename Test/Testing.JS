
// Global variables
let selectedTimeSlots = [];
let selectedPeriod = null;
let cartItems = [];
let selectedDate = null;
let currentOpenDropdown = null;
const PRICE_PER_SLOT = 1000;
// Time slots configuration for each period
const periodTimeSlots = {
    'morning': generateTimeSlots(6, 11, 30),
    'noon': generateTimeSlots(12, 17, 30),
    'evening': generateTimeSlots(18, 23, 30),
    'night': generateTimeSlots(0, 5, 30)
};
// Keep track of booked slots
const bookedSlots = new Map(); // key: date, value: Set of time slots
// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeCustomSelects();
    initializeDatePicker();
    setInterval(disablePastSlots, 60000);
    document.getElementById('addToCartBtn').addEventListener('click', addToCart);
    document.getElementById('proceedBtn').addEventListener('click', handleCheckout);
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
});
// Utility Functions
function getBookedSlotsKey(date) {
    return new Date(date).toISOString().split('T')[0];
}
function isSlotBooked(date, timeSlot) {
    const key = getBookedSlotsKey(date);
    return bookedSlots.get(key)?.has(timeSlot) || false;
}
function addToBookedSlots(date, timeSlots) {
    const key = getBookedSlotsKey(date);
    if (!bookedSlots.has(key)) {
        bookedSlots.set(key, new Set());
    }
    timeSlots.forEach(slot => {
        bookedSlots.get(key).add(slot);
    });
    refreshTimeSlots();
}

function removeFromBookedSlots(date, timeSlots) {
    const key = getBookedSlotsKey(date);
    if (bookedSlots.has(key)) {
        timeSlots.forEach(slot => bookedSlots.get(key).delete(slot));
        if (bookedSlots.get(key).size === 0) {
            bookedSlots.delete(key);
        }
    }
    refreshTimeSlots();
}
function refreshTimeSlots() {
    if (selectedPeriod) {
        createTimeSlots(selectedPeriod);
    }
}
function parseTimeSlot(timeSlot) {
    const startTime = timeSlot.split(' - ')[0];
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let totalMinutes = hours * 60 + minutes;
    if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period === 'AM' && hours === 12) totalMinutes = minutes;
    
    return totalMinutes;
}
// Time Slot Generation and Management
function generateTimeSlots(startHour, endHour, interval) {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const startTime = new Date();
            startTime.setHours(hour, minute, 0, 0);
            
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + interval);
            
            const startHour12 = startTime.getHours() % 12 || 12;
            const startPeriod = startTime.getHours() >= 12 ? 'PM' : 'AM';
            
            const endHour12 = endTime.getHours() % 12 || 12;
            const endPeriod = endTime.getHours() >= 12 ? 'PM' : 'AM';
            
            const timeSlot = `${startHour12}:${minute.toString().padStart(2, '0')} ${startPeriod} - ${endHour12}:${endTime.getMinutes().toString().padStart(2, '0')} ${endPeriod}`;
            slots.push(timeSlot);
        }
    }
    return slots;
}
function createTimeSlots(period) {
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = '';
    const slots = periodTimeSlots[period];
    if (!slots) return;
    slots.forEach(time => {
        const button = document.createElement('button');
        button.className = 'slot-button';
        button.setAttribute('data-time', time);
        button.textContent = time;
        
        // Check if slot is already booked
        if (selectedDate && isSlotBooked(selectedDate, time)) {
            button.classList.add('disabled');
            button.disabled = true;  // Actually disable the button
        }
        
        if (selectedTimeSlots.includes(time)) {
            button.classList.add('active');
        }
        
        button.addEventListener('click', handleTimeSlotClick);
        timeSlotsContainer.appendChild(button);
    });
    disablePastSlots();
}
// Modify the handleTimeSlotClick function to check for sports and pitch selection first
function handleTimeSlotClick(event) {
    const sportsSelect = document.getElementById('sportsSelect');
    const pitchSelect = document.getElementById('pitchSelect');
    
    // Get the actual selected values
    const selectedSport = sportsSelect.querySelector('.select-label').textContent.trim();
    const selectedPitch = pitchSelect.querySelector('.select-label').textContent.trim();
    
    // Check if default values are still selected
    if (selectedSport === 'Select Sports' || selectedPitch === 'Select Pitch Size') {
        alert('Please select both Sports and Pitch Size first');
        return;
    }
    if (event.target.classList.contains('disabled') || event.target.disabled) {
        return;
    }
    const timeValue = event.target.dataset.time;
    
    // Check if the slot is already booked
    if (isSlotBooked(selectedDate, timeValue)) {
        return;
    }
    const slotButtons = Array.from(document.querySelectorAll('.slot-button'));
    const clickedIndex = slotButtons.findIndex(button => button.dataset.time === timeValue);
    
    if (!event.target.classList.contains('active')) {
        if (selectedTimeSlots.length === 0) {
            selectedTimeSlots = [timeValue];
            event.target.classList.add('active');
        } else {
            const selectedIndices = slotButtons
                .map((button, index) => button.classList.contains('active') ? index : -1)
                .filter(index => index !== -1);
            const firstSelected = Math.min(...selectedIndices);
            const lastSelected = Math.max(...selectedIndices);
            // Check if there are any booked slots between the selected range
            const noBookedSlotsInBetween = Array.from(slotButtons)
                .slice(Math.min(clickedIndex, firstSelected), Math.max(clickedIndex, lastSelected) + 1)
                .every(button => !isSlotBooked(selectedDate, button.dataset.time));
            if ((clickedIndex === firstSelected - 1 || clickedIndex === lastSelected + 1) && noBookedSlotsInBetween) {
                selectedTimeSlots.push(timeValue);
                event.target.classList.add('active');
                
                selectedTimeSlots.sort((a, b) => {
                    const timeA = parseTimeSlot(a);
                    const timeB = parseTimeSlot(b);
                    return timeA - timeB;
                });
            }
        }
    } else {
        const selectedIndices = slotButtons
            .map((button, index) => button.classList.contains('active') ? index : -1)
            .filter(index => index !== -1);
        
        const firstSelected = Math.min(...selectedIndices);
        const lastSelected = Math.max(...selectedIndices);
        if (clickedIndex === firstSelected || clickedIndex === lastSelected) {
            selectedTimeSlots = selectedTimeSlots.filter(slot => slot !== timeValue);
            event.target.classList.remove('active');
        }
    }
    
    updateCartButton();
}

function disablePastSlots() {
    if (!selectedDate) return;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);
    
    document.querySelectorAll('.slot-button').forEach(slot => {
        if (selectedDay < today) {
            slot.classList.add('disabled');
            return;
        }
        if (selectedDay.getTime() === today.getTime()) {
            const timeText = slot.dataset.time.split(' - ')[0];
            const [time, period] = timeText.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            
            let slotHour = hours;
            if (period === 'PM' && hours !== 12) slotHour += 12;
            if (period === 'AM' && hours === 12) slotHour = 0;
            const slotTime = new Date(selectedDay);
            slotTime.setHours(slotHour, minutes);
            if (slotTime <= now) {
                slot.classList.add('disabled');
            } else {
                slot.classList.remove('disabled');
            }
        } else {
            slot.classList.remove('disabled');
        }
    });
}
// Custom Select Implementation
function initializeCustomSelects() {
    const customSelects = document.querySelectorAll('.custom-select');
    
    customSelects.forEach(select => {
        const button = select.querySelector('.select-button');
        const options = select.querySelector('.options-list');
        
        if (!button || !options) return;
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            customSelects.forEach(s => {
                if (s !== select) {
                    s.classList.remove('active');
                }
            });
            select.classList.toggle('active');
        });
        if (options) {
            options.querySelectorAll('li').forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.dataset.value;
                    const label = option.innerHTML;
                    button.querySelector('.select-label').innerHTML = label;
                    select.classList.remove('active');
                    
                    if (select.id === 'timePeriodSelect') {
                        const previousPeriod = selectedPeriod;
                        selectedPeriod = value;
                        
                        const currentSelections = [...selectedTimeSlots];
                        createTimeSlots(value);
                        
                        if (currentSelections.length > 0 && previousPeriod) {
                            handleCrossPeroidSelection(currentSelections, previousPeriod, value);
                        }
                    }
                    
                    updateCartButton();
                });
            });
        }
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            customSelects.forEach(select => select.classList.remove('active'));
        }
    });
}
// Date Picker Implementation
function initializeDatePicker() {
    const dateSelect = document.getElementById('dateSelect');
    const dateButton = document.getElementById('dateButton');
    const calendarPopup = document.getElementById('calendarPopup');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    
    if (!dateButton || !calendarPopup || !prevMonth || !nextMonth) {
        console.error('Calendar elements not found');
        return;
    }
    
    // Set initial date to today
    let currentDate = new Date();
    selectedDate = currentDate; // Set selectedDate to today (Current date)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1); // One month ahead date limit
    
    // Format and display today's date initially 
    const formattedToday = currentDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    
    const dateButtonLabel = dateButton.querySelector('.select-label');
    if (dateButtonLabel) {
        dateButtonLabel.innerHTML = `
            <i class="far fa-calendar"></i>
            ${formattedToday}
        `;
    }
    
    // calendar popup visibility
    dateButton.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (calendarPopup.classList.contains('show')) {
            calendarPopup.classList.remove('show');
        } else {
            calendarPopup.classList.add('show');
            renderCalendar(currentDate);
        }
    });
    
    // close popup when clicking outside
    document.addEventListener('click', function(e) {
        if (!dateSelect.contains(e.target)) {
            calendarPopup.classList.remove('show');
        }
    });
    
    // moving from one month to another also Prevents going before current month
    prevMonth.addEventListener('click', function(e) {
        e.stopPropagation();
        const today = new Date();
        if (currentDate.getMonth() === today.getMonth() && 
            currentDate.getFullYear() === today.getFullYear()) {
            return;
        }
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });
    nextMonth.addEventListener('click', function(e) {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });
    // Initial render with today selected
    renderCalendar(currentDate);
    
    // Create time slots for today if period is selected
    if (selectedPeriod) {
        createTimeSlots(selectedPeriod);
    }
}

function renderCalendar(date) {
    const currentMonthElement = document.getElementById('currentMonth');
    const calendarDates = document.getElementById('calendarDates');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    if (!currentMonthElement || !calendarDates) {
        console.error('Calendar elements not found');
        return;
    }
    currentMonthElement.textContent = `${months[date.getMonth()]} ${date.getFullYear()}`;
    
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);
    maxDate.setHours(0, 0, 0, 0);
    
    let datesHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        datesHTML += '<div class="empty"></div>';
    }
    
    // Generate calendar dates
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const cellDate = new Date(date.getFullYear(), date.getMonth(), i);
        const isDisabled = cellDate < today || cellDate > maxDate;
        const isToday = cellDate.getDate() === today.getDate() && 
                       cellDate.getMonth() === today.getMonth() && 
                       cellDate.getFullYear() === today.getFullYear();
        const isSelected = selectedDate && 
                          cellDate.getDate() === new Date(selectedDate).getDate() &&
                          cellDate.getMonth() === new Date(selectedDate).getMonth() &&
                          cellDate.getFullYear() === new Date(selectedDate).getFullYear();
        
        const classes = [
            'calendar-date',
            isDisabled ? 'disabled' : '',
            isSelected ? 'selected' : '',
            isToday ? 'today' : ''
        ].filter(Boolean).join(' ');
        
        datesHTML += `
            <div class="${classes}" data-date="${cellDate.toISOString()}">
                ${i}
            </div>
        `;
    }
    
    calendarDates.innerHTML = datesHTML;
    
    // Add click handlers to calendar dates
    document.querySelectorAll('.calendar-date:not(.disabled)').forEach(dateElement => {
        dateElement.addEventListener('click', function() {
            const selectedDateObj = new Date(this.dataset.date);
            selectedDate = selectedDateObj;
            
            const formattedDate = selectedDateObj.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            
            const dateButtonLabel = document.querySelector('#dateButton .select-label');
            if (dateButtonLabel) {
                dateButtonLabel.innerHTML = `
                    <i class="far fa-calendar"></i>
                    ${formattedDate}
                `;
            }
            
            document.querySelectorAll('.calendar-date').forEach(d => d.classList.remove('selected'));
            this.classList.add('selected');
            
            document.getElementById('calendarPopup').classList.remove('show');
            
            if (selectedPeriod) {
                createTimeSlots(selectedPeriod);
            }
            
            updateCartButton();
        });
    });
}
// Cart Management
// Cart Management (continued)
function updateCartButton() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const sportsSelect = document.getElementById('sportsSelect');
    const pitchSelect = document.getElementById('pitchSelect');
    
    // Get the actual selected values
    const selectedSport = sportsSelect.querySelector('.select-label').textContent.trim();
    const selectedPitch = pitchSelect.querySelector('.select-label').textContent.trim();
    
    // Check if default values are still selected
    const isSportsSelected = selectedSport !== 'Select Sports';
    const isPitchSelected = selectedPitch !== 'Select Pitch Size';
    const areSlotsSelected = selectedTimeSlots.length > 0;
    
    // All conditions must be true for the button to be active
    const isValid = isSportsSelected && isPitchSelected && areSlotsSelected;
    addToCartBtn.disabled = !isValid;
    addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
    
    if (isValid) {
        addToCartBtn.classList.add('active');
    } else {
        addToCartBtn.classList.remove('active');
    }
}

function addToCart() {
    const sportsSelect = document.getElementById('sportsSelect');
    const pitchSelect = document.getElementById('pitchSelect');
    
    const selectedSport = sportsSelect.querySelector('.select-label').textContent.trim();
    const selectedPitch = pitchSelect.querySelector('.select-label').textContent.trim();
    
    if (selectedSport === 'Select Sports' || selectedPitch === 'Select Pitch Size') {
        alert('Please select both Sports and Pitch Size');
        return;
    }
    if (!selectedDate || selectedTimeSlots.length === 0) {
        alert('Please select date and time slots');
        return;
    }
    // Check if any selected slots are already booked
    const anySlotBooked = selectedTimeSlots.some(slot => isSlotBooked(selectedDate, slot));
    if (anySlotBooked) {
        alert('Some of the selected slots are already booked. Please select different time slots.');
        return;
    }
    // Proceed with adding to cart...
    const bookingId = Date.now().toString();
    const timeRange = `${selectedTimeSlots[0].split(' - ')[0]} - ${selectedTimeSlots[selectedTimeSlots.length - 1].split(' - ')[1]}`;
    const cartItem = {
        id: bookingId,
        sport: selectedSport,
        pitch: selectedPitch,
        date: selectedDate,
        time: timeRange,
        slots: selectedTimeSlots.length,
        timeSlots: [...selectedTimeSlots],
        price: PRICE_PER_SLOT * selectedTimeSlots.length
    };
    addToBookedSlots(selectedDate, selectedTimeSlots);
    cartItems.push(cartItem);
    
    selectedTimeSlots = [];
    document.querySelectorAll('.slot-button').forEach(button => {
        button.classList.remove('active');
    });
    
    updateCartDisplay();
    updateCartButton();
}
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const proceedBtn = document.getElementById('proceedBtn');
    
    cartCount.textContent = cartItems.length;
    cartItemsContainer.innerHTML = '';
    let totalMinutesBooked = 0;
    
    cartItems.forEach(item => {
        const slots = item.slots || 1;
        totalMinutesBooked += (slots * 30);
        
        const formattedDate = new Date(item.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-content">
                <div class="cart-item-header">
                    <span class="cart-item-title">${item.sport} - ${item.pitch}</span>
                    <span class="cart-item-price">INR ${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-details">
                    <span>${formattedDate}</span>
                    <span>${item.time}</span>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    const isHourOrMore = totalMinutesBooked >= 60;
    
    proceedBtn.disabled = !isHourOrMore || cartItems.length === 0;
    
    if (isHourOrMore && cartItems.length > 0) {
        proceedBtn.classList.add('active');
    } else {
        proceedBtn.classList.remove('active');
    }
    
    proceedBtn.innerHTML = `
        <i class="fas fa-check"></i>
        Proceed INR ${total.toFixed(2)}
    `;
}
function removeFromCart(itemId) {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
        removeFromBookedSlots(item.date, item.timeSlots);
    }
    
    cartItems = cartItems.filter(item => item.id !== itemId);
    updateCartDisplay();
}
function handleCheckout() {
    const totalMinutesBooked = cartItems.reduce((total, item) => total + (item.slots * 30), 0);
    
    if (cartItems.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    if (totalMinutesBooked < 60) {
        alert('Minimum booking duration should be 1 hour');
        return;
    }
    
    alert('Proceeding to checkout with ' + cartItems.length + ' items');
    console.log('Cart items for checkout:', cartItems);
}
function clearCart() {
    if (cartItems.length === 0) {
        return; // Don't show confirmation if cart is empty
    }
    
    if (confirm('Are you sure you want to clear the cart?')) {
        // Remove all booked slots
        cartItems.forEach(item => {
            removeFromBookedSlots(item.date, item.timeSlots);
        });
        
        // Clear cart items array
        cartItems = [];
        
        // Reset selected time slots
        selectedTimeSlots = [];
        
        // Update UI
        updateCartDisplay();
        updateCartButton();
        
        // Reset time slot buttons if any are selected
        document.querySelectorAll('.slot-button').forEach(button => {
            button.classList.remove('active');
        });
    }
}
