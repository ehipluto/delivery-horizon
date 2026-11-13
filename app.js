'use strict';

const CLOSURES_KEY = 'planner_custom_closures_v1';
const GAP_DAYS = 7;
const REQUEST_TOLERANCE_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const LANGUAGE_KEY = 'delivery_horizon_language';
const LOCALES = { it: 'it-IT', en: 'en-GB' };

const TRANSLATIONS = {
    it: {
        language: "Lingua",
        orderDate: "Data Registrazione Ordine",
        leadTime: "Lead Time Fornitore (Settimane)",
        leadDown: "Riduci il lead time",
        leadUp: "Aumenta il lead time",
        customerEstimate: "Stima Consegna Cliente (+ 7gg fissi)",
        requestDate: "Richiesta Specifica Cliente",
        skipHolidays: "Salta le festività nazionali italiane",
        manageClosures: "Pianifica Chiusure Aziendali",
        order: "Data Ordine",
        supplier: "Arrivo Merce Stimato",
        customer: "Consegna Cliente",
        suggested: "Richiesta Non Fattibile",
        legendOrder: "Ordine",
        legendSupplier: "Fornitore",
        legendCustomer: "Cliente",
        legendIncompatible: "Incompatibile",
        legendClosure: "Chiusura/Ferie",
        dateDetails: "Dettaglio Giorno",
        closeDate: "Chiudi dettaglio giorno",
        setOrder: "Imposta come Data Ordine",
        setRequest: "Imposta come Richiesta Cliente",
        closures: "Ferie & Chiusure",
        closeClosures: "Chiudi ferie e chiusure",
        newClosure: "Nuovo Periodo di Chiusura",
        closurePlaceholder: "Descrizione (es. Ferie Estive)",
        closureStart: "Data inizio chiusura",
        closureEnd: "Data fine chiusura",
        saveClosure: "Salva Chiusura",
        storageFailed: "Impossibile salvare le chiusure nel browser. Le modifiche valgono per questa sessione.",
        invalidLeadTime: "Inserisci un lead time di almeno una settimana intera.",
        outOfRange: "Le date stimate superano l’intervallo supportato.",
        billing: "Fatturazione su mesi diversi.",
        shiftedRequest: "Data richiesta spostata a giorno lavorativo.",
        incompatible: "Anticipo di {days}gg incompatibile con il Lead Time.",
        emptyClosures: "Nessuna chiusura impostata.",
        removeClosure: "Elimina chiusura: {name}",
        missingFields: "Compila tutti i campi.",
        invalidRange: "Data fine antecedente a data inizio.",
        incompatibleTooltip: "Richiesta Incompatibile",
        closureTooltip: "Chiusura: {name}",
        holidayTooltip: "Festività Nazionale",
        weekendTooltip: "Weekend",
        dayHint: "Doppio clic per evento",
        collapse: "Riduci Vista",
        expand: "Carica Anno Successivo",
        title: "Delivery Horizon | Pianificazione logistica",
    },
    en: {
        language: "Language",
        orderDate: "Order Date",
        leadTime: "Supplier Lead Time (Weeks)",
        leadDown: "Decrease lead time",
        leadUp: "Increase lead time",
        customerEstimate: "Estimated Customer Delivery (+7 days)",
        requestDate: "Requested Delivery Date",
        skipHolidays: "Skip Italian public holidays",
        manageClosures: "Manage Company Closures",
        order: "Order Date",
        supplier: "Estimated Supplier Arrival",
        customer: "Customer Delivery",
        suggested: "Unfeasible Request",
        legendOrder: "Order",
        legendSupplier: "Supplier",
        legendCustomer: "Customer",
        legendIncompatible: "Unfeasible",
        legendClosure: "Closure/Holiday",
        dateDetails: "Date Details",
        closeDate: "Close date details",
        setOrder: "Set as Order Date",
        setRequest: "Set as Requested Delivery Date",
        closures: "Holidays & Closures",
        closeClosures: "Close holidays and closures",
        newClosure: "New Closure Period",
        closurePlaceholder: "Description (e.g. Summer Break)",
        closureStart: "Closure start date",
        closureEnd: "Closure end date",
        saveClosure: "Save Closure",
        storageFailed: "Could not save closures in the browser. Changes apply to this session.",
        invalidLeadTime: "Enter a lead time of at least one whole week.",
        outOfRange: "The estimated dates are outside the supported range.",
        billing: "Billing falls in different months.",
        shiftedRequest: "The requested date was moved to a working day.",
        incompatible: "The requested date is {days} days earlier than estimated and incompatible with the lead time.",
        emptyClosures: "No closures scheduled.",
        removeClosure: "Delete closure: {name}",
        missingFields: "Complete all fields.",
        invalidRange: "The end date is before the start date.",
        incompatibleTooltip: "Unfeasible Request",
        closureTooltip: "Closure: {name}",
        holidayTooltip: "Public Holiday",
        weekendTooltip: "Weekend",
        dayHint: "Double-click for date options",
        collapse: "Show Fewer Months",
        expand: "Load Next Year",
        title: "Delivery Horizon | Logistics Planner",
    },
};
const FIXED_HOLIDAYS = [
    '01-01', '01-06', '04-25', '05-01', '06-02',
    '08-15', '11-01', '12-08', '12-25', '12-26',
];

const orderInput = document.getElementById('orderDate');
const supplierWeeksInput = document.getElementById('weeksSupplier');
const customerWeeksInput = document.getElementById('weeksCustomer');
const requestedDateInput = document.getElementById('customerRequestedDate');
const holidayToggle = document.getElementById('skipNationalHolidays');
const calendarContainer = document.getElementById('calendarContainer');
const expandButton = document.getElementById('expandButton');
const holidaysByYear = new Map();

const languageSelect = document.getElementById('languageSelect');
let language = loadLanguage();

let customClosures = loadClosures();
let currentDates = { order: null, supplier: null, customer: null, suggested: null };
let isExpanded = false;
let selectedDateForModal = null;
function loadLanguage() {
    try {
        return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'it';
    } catch {
        return 'it';
    }
}

function t(key, values = {}) {
    return TRANSLATIONS[language][key].replace(/\{(\w+)\}/g, (_, name) => values[name]);
}
function applyLanguage() {
    document.documentElement.lang = language;
    document.title = t('title');
    languageSelect.value = language;

    for (const element of document.querySelectorAll('[data-i18n]')) {
        element.textContent = t(element.dataset.i18n);
    }
    for (const attribute of ['aria-label', 'placeholder']) {
        for (const element of document.querySelectorAll('[data-i18n-' + attribute + ']')) {
            element.setAttribute(attribute, t(element.getAttribute('data-i18n-' + attribute)));
        }
    }

    updateExpansionButton();
    if (selectedDateForModal) {
        document.getElementById('modalDateDisplay').textContent = formatInputDate(selectedDateForModal);
    }
    if (!document.getElementById('closureModal').hidden) {
        renderClosureList();
    }
    calculateDates();
}

function changeLanguage() {
    language = languageSelect.value;
    try {
        localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
    }
    applyLanguage();
}
function parseLocalDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(0);
    date.setHours(0, 0, 0, 0);
    date.setFullYear(year, month - 1, day);
    return date;
}

function toDateInputValue(date) {
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    result.setHours(0, 0, 0, 0);
    return result;
}

function formatDate(date) {
    return date
        ? date.toLocaleDateString(LOCALES[language], { day: '2-digit', month: 'short', year: 'numeric' })
        : '--';
}

function formatInputDate(value) {
    return parseLocalDate(value).toLocaleDateString(LOCALES[language], {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
}
function getEaster(year) {
    const floor = Math.floor;
    const goldenNumber = year % 19;
    const century = floor(year / 100);
    const epact = (century - floor(century / 4) - floor((8 * century + 13) / 25)
        + 19 * goldenNumber + 15) % 30;
    const correctedEpact = epact - floor(epact / 28)
        * (1 - floor(29 / (epact + 1)) * floor((21 - goldenNumber) / 11));
    const weekday = (year + floor(year / 4) + correctedEpact + 2
        - century + floor(century / 4)) % 7;
    const offset = correctedEpact - weekday;
    const month = 3 + floor((offset + 40) / 44);
    const day = offset + 28 - 31 * floor(month / 4);
    return parseLocalDate(`${String(year).padStart(4, '0')}-${month}-${day}`);
}
function getHolidaysForYear(year) {
    if (!holidaysByYear.has(year)) {
        const yearText = String(year).padStart(4, '0');
        const holidays = new Set(FIXED_HOLIDAYS.map((date) => `${yearText}-${date}`));
        holidays.add(toDateInputValue(addDays(getEaster(year), 1)));
        if (year >= 2026) {
            holidays.add(`${yearText}-10-04`);
        }

        holidaysByYear.set(year, holidays);
    }

    return holidaysByYear.get(year);
}

function isWeekend(date) {
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6;
}

function isExcludedNationalHoliday(date) {
    return holidayToggle.checked && getHolidaysForYear(date.getFullYear()).has(toDateInputValue(date));
}

function isHolidayOrWeekend(date) {
    return isWeekend(date) || isExcludedNationalHoliday(date);
}
function loadClosures() {
    try {
        const savedClosures = JSON.parse(localStorage.getItem(CLOSURES_KEY));
        return Array.isArray(savedClosures) ? savedClosures : [];
    } catch {
        return [];
    }
}

function saveClosures() {
    try {
        localStorage.setItem(CLOSURES_KEY, JSON.stringify(customClosures));
    } catch {
        showClosureMessage(t('storageFailed'));
    }
}

function getClosureForDate(date) {
    return customClosures.find(({ start, end }) =>
        date >= parseLocalDate(start) && date <= parseLocalDate(end));
}
function getNextValidDay(date) {
    let candidate = new Date(date);

    while (Number.isFinite(candidate.getTime())) {
        if (isHolidayOrWeekend(candidate)) {
            candidate = addDays(candidate, 1);
            continue;
        }

        const closure = getClosureForDate(candidate);
        if (!closure) {
            break;
        }

        candidate = addDays(parseLocalDate(closure.end), 1);
    }

    return candidate;
}

function isSameMonth(first, second) {
    return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
}
function calculateDates() {
    const weeksSupplier = supplierWeeksInput.valueAsNumber;
    const validLeadTime = Number.isInteger(weeksSupplier) && weeksSupplier >= 1;
    customerWeeksInput.value = validLeadTime ? weeksSupplier + 1 : '';

    if (!orderInput.value) {
        renderPlan({});
        return;
    }

    const order = parseLocalDate(orderInput.value);
    if (!validLeadTime) {
        renderPlan({ order }, t('invalidLeadTime'));
        return;
    }

    let supplier = getNextValidDay(addDays(order, weeksSupplier * 7));
    let customer = getNextValidDay(addDays(supplier, GAP_DAYS));
    if (!isSameMonth(supplier, customer) && Number.isFinite(customer.getTime())) {
        const firstOfMonth = new Date(customer);
        firstOfMonth.setDate(1);
        supplier = getNextValidDay(firstOfMonth);
        customer = getNextValidDay(addDays(supplier, GAP_DAYS));
    }

    if (!Number.isFinite(customer.getTime())) {
        renderPlan({ order }, t('outOfRange'));
        return;
    }

    let suggested = null;
    let warning = '';
    let isWarningSoft = false;

    if (requestedDateInput.value) {
        const requested = parseLocalDate(requestedDateInput.value);
        const difference = Math.round((requested - customer) / MS_PER_DAY);

        if (difference >= -REQUEST_TOLERANCE_DAYS) {
            customer = getNextValidDay(requested);
            supplier = getNextValidDay(addDays(customer, -GAP_DAYS));

            const notes = [];
            if (!isSameMonth(supplier, customer)) {
                notes.push(t('billing'));
            }
            if (customer.getTime() !== requested.getTime()) {
                notes.push(t('shiftedRequest'));
            }
            if (notes.length > 0) {
                warning = `⚠️ ${notes.join(' ')}`;
                isWarningSoft = true;
            }
        } else {
            warning = `⚠️ ${t('incompatible', { days: Math.abs(difference) })}`;
            suggested = requested;
        }
    }

    renderPlan({ order, supplier, customer, suggested }, warning, isWarningSoft);
}
function renderPlan(dates, warning = '', isWarningSoft = false) {
    currentDates = { order: null, supplier: null, customer: null, suggested: null, ...dates };

    const warningMessage = document.getElementById('warningMessage');
    warningMessage.textContent = warning;
    warningMessage.hidden = !warning;
    warningMessage.classList.toggle('warning-soft', isWarningSoft);

    document.getElementById('summaryOrderDate').textContent = formatDate(currentDates.order);
    document.getElementById('summarySupplierDate').textContent = formatDate(currentDates.supplier);
    document.getElementById('summaryCustomerDate').textContent = formatDate(currentDates.customer);
    document.getElementById('summarySuggestedDate').textContent = formatDate(currentDates.suggested);
    document.getElementById('summarySuggestedCard').hidden = !currentDates.suggested;
    renderCalendars();
}

function changeLeadTime(delta) {
    const weeks = Math.trunc(supplierWeeksInput.valueAsNumber) || 1;
    supplierWeeksInput.value = Math.max(1, weeks + delta);
    calculateDates();
}
function scrollToCurrentDate(type) {
    const date = type === 'customer' && currentDates.suggested
        ? currentDates.suggested
        : currentDates[type];
    if (!date) {
        return;
    }

    const monthId = `month-${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!document.getElementById(monthId) && !isExpanded) {
        toggleCalendarExpansion();
    }

    const month = document.getElementById(monthId);
    if (month) {
        month.scrollIntoView({ behavior: 'smooth', block: 'start' });
        month.classList.add('is-highlighted');
        setTimeout(() => month.classList.remove('is-highlighted'), 1500);
    }
}

function openDateModal(dateValue) {
    selectedDateForModal = dateValue;
    document.getElementById('modalDateDisplay').textContent = formatInputDate(dateValue);
    document.getElementById('dateModal').hidden = false;
}

function closeModal(id) {
    document.getElementById(id).hidden = true;
    selectedDateForModal = null;
}

function setFromModal(type) {
    if (!selectedDateForModal) {
        return;
    }

    const input = type === 'order' ? orderInput : requestedDateInput;
    input.value = selectedDateForModal;
    calculateDates();
    closeModal('dateModal');
}

function createElement(tag, className, text = '') {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}
function renderClosureList() {
    const list = document.getElementById('closureList');
    list.replaceChildren();

    if (customClosures.length === 0) {
        list.append(createElement('div', 'closure-list-empty', t('emptyClosures')));
        return;
    }

    const sortedClosures = [...customClosures].sort((first, second) =>
        parseLocalDate(first.start) - parseLocalDate(second.start));

    for (const closure of sortedClosures) {
        const item = createElement('div', 'closure-item');
        const details = document.createElement('div');
        const dates = `${formatInputDate(closure.start)} - ${formatInputDate(closure.end)}`;
        details.append(
            createElement('div', 'closure-name', closure.name),
            createElement('div', 'closure-dates', dates),
        );

        const removeButton = createElement('button', 'btn-icon-del');
        removeButton.type = 'button';
        removeButton.setAttribute('aria-label', t('removeClosure', { name: closure.name }));
        const icon = createElement('i', 'fa-solid fa-trash-can');
        icon.setAttribute('aria-hidden', 'true');
        removeButton.append(icon);
        removeButton.addEventListener('click', () => removeClosure(closure.id));

        item.append(details, removeButton);
        list.append(item);
    }
}

function openClosureModal() {
    renderClosureList();
    document.getElementById('closureModal').hidden = false;
}

function showClosureMessage(message) {
    if (typeof window.Toastify === 'function') {
        window.Toastify({ text: message, duration: 3000, className: 'closure-toast' }).showToast();
    } else {
        window.alert(message);
    }
}
function addClosure() {
    const nameInput = document.getElementById('newClosureName');
    const startInput = document.getElementById('newClosureStart');
    const endInput = document.getElementById('newClosureEnd');
    const name = nameInput.value.trim();
    const start = startInput.value;
    const end = endInput.value;

    if (!name || !start || !end) {
        showClosureMessage(t('missingFields'));
        return;
    }
    if (startInput.valueAsNumber > endInput.valueAsNumber) {
        showClosureMessage(t('invalidRange'));
        return;
    }

    customClosures.push({ id: Date.now().toString(), name, start, end });
    saveClosures();
    renderClosureList();
    calculateDates();

    nameInput.value = '';
    startInput.value = '';
    endInput.value = '';
}

function removeClosure(id) {
    customClosures = customClosures.filter((closure) => closure.id !== id);
    saveClosures();
    renderClosureList();
    calculateDates();
}
function renderDay(date) {
    const dateValue = toDateInputValue(date);
    const cell = createElement('div', 'day', date.getDate());
    cell.addEventListener('dblclick', () => openDateModal(dateValue));

    const tooltip = [];
    const milestones = [
        [currentDates.order, 'order-day', t('order')],
        [currentDates.supplier, 'requested', t('supplier')],
        [currentDates.customer, 'predicted', t('customer')],
        [currentDates.suggested, 'suggested-customer', t('incompatibleTooltip')],
    ];

    for (const [milestone, className, label] of milestones) {
        if (milestone?.getTime() === date.getTime()) {
            cell.classList.add(className);
            tooltip.push(label);
        }
    }

    const closure = getClosureForDate(date);
    if (closure) {
        cell.classList.add('closure-day');
        if (tooltip.length === 0) {
            tooltip.push(t('closureTooltip', { name: closure.name }));
        }
    } else if (isHolidayOrWeekend(date)) {
        cell.classList.add('holiday');
        if (tooltip.length === 0) {
            tooltip.push(isExcludedNationalHoliday(date) ? t('holidayTooltip') : t('weekendTooltip'));
        }
    }

    if (tooltip.length > 0) {
        cell.dataset.tooltip = tooltip.join(' | ');
    } else {
        cell.dataset.tooltipDelayed = t('dayHint');
    }

    return cell;
}
function renderCalendars() {
    calendarContainer.replaceChildren();
    if (!currentDates.order) {
        return;
    }

    const today = new Date();
    const startYear = today.getFullYear();
    const startMonth = today.getMonth();
    const totalMonths = isExpanded ? 24 : 12;
    const weekdayFormat = new Intl.DateTimeFormat(LOCALES[language], { weekday: 'short' });
    const monday = new Date(2024, 0, 1);
    const weekdayLabels = Array.from({ length: 7 }, (_, index) => weekdayFormat.format(addDays(monday, index)));
    const fragment = document.createDocumentFragment();

    for (let offset = 0; offset < totalMonths; offset += 1) {
        const firstOfMonth = new Date(startYear, startMonth + offset, 1);
        const year = firstOfMonth.getFullYear();
        const month = firstOfMonth.getMonth();
        const monthSection = createElement('div', 'month');
        monthSection.id = `month-${year}-${month + 1}`;

        const title = firstOfMonth.toLocaleString(LOCALES[language], { month: 'long', year: 'numeric' });
        const header = createElement('div', 'month-header', title);
        const grid = createElement('div', 'days-grid');

        for (const label of weekdayLabels) {
            grid.append(createElement('div', 'day-name', label));
        }

        const leadingDays = (firstOfMonth.getDay() + 6) % 7;
        for (let index = 0; index < leadingDays; index += 1) {
            grid.append(createElement('div', 'day empty'));
        }

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day += 1) {
            grid.append(renderDay(new Date(year, month, day)));
        }

        monthSection.append(header, grid);
        fragment.append(monthSection);
    }

    calendarContainer.append(fragment);
}

function toggleCalendarExpansion() {
    isExpanded = !isExpanded;
    updateExpansionButton();
    renderCalendars();
}

function updateExpansionButton() {
    expandButton.textContent = isExpanded ? t('collapse') : t('expand');
    expandButton.setAttribute('aria-expanded', String(isExpanded));
}
function initializePlanner() {
    for (const input of [orderInput, supplierWeeksInput, requestedDateInput]) {
        input.addEventListener('input', calculateDates);
    }
    languageSelect.addEventListener('change', changeLanguage);
    holidayToggle.addEventListener('change', calculateDates);
    expandButton.addEventListener('click', toggleCalendarExpansion);
    document.getElementById('openClosureModal').addEventListener('click', openClosureModal);
    document.getElementById('saveClosure').addEventListener('click', addClosure);

    for (const button of document.querySelectorAll('[data-lead-time-step]')) {
        button.addEventListener('click', () => changeLeadTime(Number(button.dataset.leadTimeStep)));
    }
    for (const card of document.querySelectorAll('[data-scroll-date]')) {
        card.addEventListener('click', () => scrollToCurrentDate(card.dataset.scrollDate));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                card.click();
            }
        });
    }
    for (const button of document.querySelectorAll('[data-close-modal]')) {
        button.addEventListener('click', () => closeModal(button.dataset.closeModal));
    }
    for (const button of document.querySelectorAll('[data-set-date]')) {
        button.addEventListener('click', () => setFromModal(button.dataset.setDate));
    }

    orderInput.value = toDateInputValue(new Date());
    applyLanguage();
}

initializePlanner();
