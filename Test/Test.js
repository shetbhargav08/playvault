// Global variables
let selectedTimeSlots = [];
let selectedPeriod = null;
let selectedDate = null;
let crossMidnightDate = null; // Add new variable to track cross-midnight date

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeTimeSelection();
    initializeSportsSelection();
    initializeDatePicker();
    setInterval(disablePastSlots, 60000); // Check every minute
});

// Sports selection
function initializeSportsSelection() {
    const sportButtons = document.querySelectorAll('[data-type="sport"]');
    sportButtons.forEach(button => {
        button.addEventListener('click', function() {
            sportButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Date picker functionality
function initializeDatePicker() {
    const dateButton = document.getElementById('dateButton');
    const calendarPopup = document.getElementById('calendarPopup');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    
    let currentDate = new Date();
    dateButton.textContent = "Select Date";
    
    // Show/hide calendar
    dateButton.addEventListener('click', function(e) {
        e.stopPropagation();
        currentDate = new Date(); 
        calendarPopup.style.display = calendarPopup.style.display === 'block' ? 'none' : 'block';
        renderCalendar(currentDate);
    });

    // Close calendar when clicking outside
    document.addEventListener('click', function(e) {
        if (!calendarPopup.contains(e.target) && e.target !== dateButton) {
            calendarPopup.style.display = 'none';
        }
    });

    // Month navigation
    prevMonth.addEventListener('click', function() {
        if (currentDate.getMonth() === 0) {  // Prevent going to December if in January
            return;
        }
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
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyCell = document.createElement('div');
        calendarDates.appendChild(emptyCell);
    }
    
    // Add calendar dates
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dateCell = document.createElement('div');
        const cellDate = new Date(date.getFullYear(), date.getMonth(), i);
        dateCell.className = 'calendar-date';
        dateCell.textContent = i;
        
        if (cellDate < today || cellDate > maxDate) {
            dateCell.classList.add('disabled');
        } else {
            dateCell.addEventListener('click', function () {
                selectedDate = new Date(date.getFullYear(), date.getMonth(), i);
                const formattedDate = `${i} ${months[date.getMonth()]} ${date.getFullYear()}`;
                document.getElementById('dateButton').textContent = formattedDate;
                document.getElementById('calendarPopup').style.display = 'none';
                document.getElementById('dateButton').classList.add('selected');
                
                // Refresh time slots when date changes
                if (selectedPeriod) {
                    createTimeSlots(selectedPeriod);
                }
            });
        }
        calendarDates.appendChild(dateCell);
    }
}

// Time slots configuration for each period
const periodTimeSlots = {
    'Morning': generateTimeSlots(6, 11, 30),  // 6:00 AM to 11:30 AM
    'Noon': generateTimeSlots(12, 17, 30),    // 12:00 PM to 5:30 PM
    'Evening': generateTimeSlots(18, 23, 30), // 6:00 PM to 11:30 PM
    'Night': generateTimeSlots(0, 5, 30)      // 12:00 AM to 5:30 AM
};

// Create a flat array of all time slots for checking consecutive slots
const allTimeSlotsInOrder = [
    ...generateTimeSlots(0, 5, 30),   // Night
    ...generateTimeSlots(6, 11, 30),  // Morning
    ...generateTimeSlots(12, 17, 30), // Noon
    ...generateTimeSlots(18, 23, 30)  // Evening
];

// Helper function to generate time slots
function generateTimeSlots(startHour, endHour, interval) {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const startTime = new Date();
            startTime.setHours(hour, minute, 0, 0);
            
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + interval);
            
            // Format start time
            const startHour12 = startTime.getHours() % 12 || 12;
            const startPeriod = startTime.getHours() >= 12 ? 'PM' : 'AM';
            
            // Format end time
            const endHour12 = endTime.getHours() % 12 || 12;
            const endPeriod = endTime.getHours() >= 12 ? 'PM' : 'AM';
            
            const timeSlot = `${startHour12}:${minute.toString().padStart(2, '0')} ${startPeriod} - ${endHour12}:${endTime.getMinutes().toString().padStart(2, '0')} ${endPeriod}`;
            slots.push(timeSlot);
        }
    }
    return slots;
}

// Update timeToMinutes function to handle new format
function timeToMinutes(timeRange) {
    // Extract the start time from the range (before the hyphen)
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

function createTimeSlots(period) {
    const slotButtonsContainer = document.querySelector('.slot-buttons');
    slotButtonsContainer.innerHTML = '';

    const slots = periodTimeSlots[period];
    if (!slots) return;

    slots.forEach(time => {
        const button = document.createElement('button');
        button.className = 'slot-button';
        button.setAttribute('data-time', time);
        button.setAttribute('data-period', period);
        button.textContent = time;
        
        // Check if this slot is already selected
        if (selectedTimeSlots.includes(time)) {
            button.classList.add('active');
        }
        
        slotButtonsContainer.appendChild(button);
    });

    initializeSlotButtons();
    disablePastSlots();
}

function initializeTimeSelection() {
    const periodButtons = document.querySelectorAll('.period-button');
    
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.dataset.period;
            
            // Update period buttons
            periodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            selectedPeriod = period;
            // Don't reset selections when changing periods
            createTimeSlots(period);
        });
    });
}

function initializeSlotButtons() {
    const timeSlots = document.querySelectorAll('.slot-button');
    
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.classList.contains('disabled')) {
                return;
            }
            
            const timeValue = this.dataset.time;
            
            if (!this.classList.contains('active')) {
                if (canSelectTimeSlot(timeValue)) {
                    this.classList.add('active');
                    selectedTimeSlots.push(timeValue);
                    selectedTimeSlots.sort((a, b) => 
                        allTimeSlotsInOrder.indexOf(a) - allTimeSlotsInOrder.indexOf(b));
                } else {
                    alert('Please select consecutive time slots');
                }
            } else {
                if (canDeselectTimeSlot(timeValue)) {
                    this.classList.remove('active');
                    selectedTimeSlots = selectedTimeSlots.filter(time => time !== timeValue);
                } else {
                    alert('You can only deselect slots from either end of your selection');
                }
            }
            toggleProceedButton();
        });
    });
}

function disablePastSlots() {
    if (!selectedDate) return;

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const allTimeSlots = document.querySelectorAll('.slot-button');
    
    allTimeSlots.forEach(slot => {
        const slotTime = slot.dataset.time;
        const slotMinutes = timeToMinutes(slotTime);
        
        // If selected date is today, disable past time slots
        if (selectedDay.getTime() === today.getTime()) {
            if (slotMinutes <= currentTime) {
                slot.classList.add('disabled');
                slot.style.backgroundColor = '#ccc';
            } else {
                slot.classList.remove('disabled');
                slot.style.backgroundColor = '';
            }
        }
        // If selected date is in the past, disable all slots
        else if (selectedDay < today) {
            slot.classList.add('disabled');
            slot.style.backgroundColor = '#ccc';
        }
        // If selected date is in the future, enable all slots
        else {
            slot.classList.remove('disabled');
            slot.style.backgroundColor = '';
        }
    });
}

function canSelectTimeSlot(newTime) {
    if (selectedTimeSlots.length === 0) return true;
    
    const newTimeIndex = allTimeSlotsInOrder.indexOf(newTime);
    
    // If we have one slot selected, check if the new slot is adjacent
    if (selectedTimeSlots.length === 1) {
        const existingTimeIndex = allTimeSlotsInOrder.indexOf(selectedTimeSlots[0]);
        return Math.abs(newTimeIndex - existingTimeIndex) === 1;
    }
    
    // If we have more slots, only allow selection if it's consecutive
    const selectedIndices = selectedTimeSlots.map(time => allTimeSlotsInOrder.indexOf(time));
    const minIndex = Math.min(...selectedIndices);
    const maxIndex = Math.max(...selectedIndices);
    
    // Allow selection only if it's immediately before the first slot or after the last slot
    return newTimeIndex === minIndex - 1 || newTimeIndex === maxIndex + 1;
}

function canDeselectTimeSlot(time) {
    if (selectedTimeSlots.length <= 1) return true;
    
    const timeIndex = allTimeSlotsInOrder.indexOf(time);
    const selectedIndices = selectedTimeSlots.map(t => allTimeSlotsInOrder.indexOf(t));
    const minIndex = Math.min(...selectedIndices);
    const maxIndex = Math.max(...selectedIndices);
    
    // Can only deselect if it's at either end of the selection
    return timeIndex === minIndex || timeIndex === maxIndex;
}

function timeToMinutes(time) {
    const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
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

function toggleProceedButton() {
    const proceedButton = document.getElementById('proceedToPayBtn');
    if (!proceedButton) return;
    
    if (selectedTimeSlots.length >= 2) {
        proceedButton.style.backgroundColor = 'black';
        proceedButton.style.color = 'white';
        proceedButton.disabled = false;
    } else {
        proceedButton.style.backgroundColor = '';
        proceedButton.style.color = ''; 
        proceedButton.disabled = true;
    }
}

function updateCartButton() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const isValid = 
        document.getElementById('sportsSelect').value &&
        document.getElementById('pitchSelect').value &&
        selectedDate &&
        selectedTimeSlots.length > 0;

    addToCartBtn.disabled = !isValid;
    
    if (isValid) {
        addToCartBtn.classList.add('active');
    } else {
        addToCartBtn.classList.remove('active');
    }
}

function addToCart() {
    const sport = document.getElementById('sportsSelect').value;
    const pitch = document.getElementById('pitchSelect').value;
    const time = selectedTimeSlots[0];

    // Check if all required fields are selected
    if (!sport || !pitch || !selectedDate || !time) {
        alert('Please select all required fields');
        return;
    }

    // Create a unique ID for the booking
    const bookingId = Date.now().toString();

    // Create cart item
    const cartItem = {
        id: bookingId,
        sport,
        pitch,
        date: selectedDate,
        time,
        price: PRICE_PER_SLOT
    };

    // Add to cart
    cartItems.push(cartItem);

    // Update cart display
    updateCartDisplay();

    // Clear selections
    selectedTimeSlots = [];
    document.querySelectorAll('.slot-button').forEach(button => {
        button.classList.remove('active');
    });
    updateCartButton();
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const proceedBtn = document.getElementById('proceedBtn');
    
    // Update cart count
    cartCount.textContent = cartItems.length;

    // Clear current cart display
    cartItemsContainer.innerHTML = '';

    // Add each item to cart display
    cartItems.forEach(item => {
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
                    <span class="cart-item-title">${item.sport.charAt(0).toUpperCase() + item.sport.slice(1)} - ${item.pitch}</span>
                    <span class="cart-item-price">INR ${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-details">
                    <span>${formattedDate}</span>
                    <span>${item.time}</span>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">&times;</button>
        `;

        cartItemsContainer.appendChild(cartItemElement);
    });

    // Update total and proceed button
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    proceedBtn.textContent = `Proceed INR ${total.toFixed(2)}`;
    proceedBtn.disabled = cartItems.length === 0;
}

function removeFromCart(itemId) {
    cartItems = cartItems.filter(item => item.id !== itemId);
    updateCartDisplay();
}

function handleCheckout() {
    if (cartItems.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Here you would typically redirect to a checkout page or payment gateway
    alert('Proceeding to checkout with ' + cartItems.length + ' items');
    console.log('Cart items for checkout:', cartItems);
}