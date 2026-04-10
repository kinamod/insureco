/**
 * SignUpPage – Multi-step insurance sign-up flow.
 *
 * Steps:
 *   0 – Personal Information  (name, email, phone, date of birth)
 *   1 – Coverage Type         (car / home / both)
 *   2 – Your Address          (street, city, state, zip)
 *   3 – Details               (car fields and/or home fields, shown
 *                              conditionally based on step 1 selection)
 *
 * State is kept in a single `formData` object so every step can read
 * data from any other step (e.g. step 3 needs the coverage selection
 * made in step 1 to decide which detail sections to render).
 *
 * Navigation helpers:
 *   handleNext   – advance one step (clamped at the last step)
 *   handleBack   – go back one step (clamped at step 0)
 *   handleCancel – abandon the flow and return to the landing page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  Select,
  SelectItem,
  NumberInput,
  DatePicker,
  DatePickerInput,
  Button,
} from '@carbon/react';
import { ArrowLeft, ArrowRight } from '@carbon/icons-react';
import StepBreadcrumb from '../components/StepBreadcrumb';
import './SignUpPage.scss';

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

/** Labels shown in the StepBreadcrumb progress indicator. */
const STEPS = [
  { label: 'Personal Info', key: 'personal' },
  { label: 'Coverage', key: 'coverage' },
  { label: 'Address', key: 'address' },
  { label: 'Details', key: 'details' },
];

/**
 * The three mutually-exclusive coverage choices the user can pick in step 1.
 * `showCar` / `showHome` flags control which detail sections render in step 3.
 */
const COVERAGE_OPTIONS = [
  {
    id: 'car',
    title: 'Car Insurance',
    description: 'Get comprehensive coverage for your vehicle',
    showCar: true,
    showHome: false,
  },
  {
    id: 'home',
    title: 'Home Insurance',
    description: 'Protect your most important asset for your family',
    showCar: false,
    showHome: true,
  },
  {
    id: 'both',
    title: 'Both Home and Car',
    description: 'Insure both and get bundle savings',
    showCar: true,
    showHome: true,
  },
];

/** All 50 US states, used to populate the State dropdown in step 2. */
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

/** Residential property categories for the Home Type dropdown. */
const HOME_TYPES = [
  'Single Family Home',
  'Condo',
  'Townhouse',
  'Multi-Family Home',
  'Mobile Home',
  'Other',
];

// Vehicle model year range: current year back 35 years.
const currentYear = new Date().getFullYear();
const CAR_YEARS = Array.from({ length: 36 }, (_, i) => currentYear - i);

// Home construction year range: 1800 – 2025 (covers all insurable properties).
const HOME_YEARS = Array.from({ length: 226 }, (_, i) => 2025 - i);

// ─────────────────────────────────────────────────────────────────────────────
// SVG icon components (inlined from the Figma design)
// ─────────────────────────────────────────────────────────────────────────────

/** Car icon used on the coverage-type selection tiles. */
function CarIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.5063 14.9437L20.2594 12.3375L17.2219 8.53125C16.9582 8.20912 16.6264 7.94952 16.2503 7.77118C15.8742 7.59285 15.4631 7.50023 15.0469 7.5H7.54688C7.08935 7.50236 6.63932 7.61631 6.2358 7.83196C5.83228 8.0476 5.48746 8.35844 5.23125 8.7375L2.69062 12.4875C2.16433 13.2587 1.88032 14.1695 1.875 15.1031V22.5C1.875 22.7486 1.97377 22.9871 2.14959 23.1629C2.3254 23.3387 2.56386 23.4375 2.8125 23.4375H4.81875C5.03464 24.2319 5.50594 24.9332 6.15993 25.4332C6.81393 25.9332 7.61428 26.2041 8.4375 26.2041C9.26072 26.2041 10.0611 25.9332 10.7151 25.4332C11.3691 24.9332 11.8404 24.2319 12.0562 23.4375H17.9437C18.1596 24.2319 18.6309 24.9332 19.2849 25.4332C19.9389 25.9332 20.7393 26.2041 21.5625 26.2041C22.3857 26.2041 23.1861 25.9332 23.8401 25.4332C24.4941 24.9332 24.9654 24.2319 25.1813 23.4375H27.1875C27.4361 23.4375 27.6746 23.3387 27.8504 23.1629C28.0262 22.9871 28.125 22.7486 28.125 22.5V15.825C28.1249 15.6323 28.0655 15.4444 27.9548 15.2867C27.844 15.129 27.6874 15.0093 27.5063 14.9437ZM8.4375 24.375C8.06666 24.375 7.70415 24.265 7.39581 24.059C7.08746 23.853 6.84714 23.5601 6.70523 23.2175C6.56331 22.8749 6.52618 22.4979 6.59853 22.1342C6.67087 21.7705 6.84945 21.4364 7.11167 21.1742C7.3739 20.912 7.70799 20.7334 8.07171 20.661C8.43542 20.5887 8.81242 20.6258 9.15503 20.7677C9.49764 20.9096 9.79048 21.15 9.99651 21.4583C10.2025 21.7666 10.3125 22.1292 10.3125 22.5C10.3125 22.9973 10.115 23.4742 9.76332 23.8258C9.41169 24.1775 8.93478 24.375 8.4375 24.375ZM21.5625 24.375C21.1917 24.375 20.8291 24.265 20.5208 24.059C20.2125 23.853 19.9721 23.5601 19.8302 23.2175C19.6883 22.8749 19.6512 22.4979 19.7235 22.1342C19.7959 21.7705 19.9745 21.4364 20.2367 21.1742C20.4989 20.912 20.833 20.7334 21.1967 20.661C21.5604 20.5887 21.9374 20.6258 22.28 20.7677C22.6226 20.9096 22.9155 21.15 23.1215 21.4583C23.3275 21.7666 23.4375 22.1292 23.4375 22.5C23.4375 22.9973 23.24 23.4742 22.8883 23.8258C22.5367 24.1775 22.0598 24.375 21.5625 24.375ZM26.25 21.5625H25.1813C24.9654 20.7681 24.4941 20.0668 23.8401 19.5668C23.1861 19.0668 22.3857 18.7959 21.5625 18.7959C20.7393 18.7959 19.9389 19.0668 19.2849 19.5668C18.6309 20.0668 18.1596 20.7681 17.9437 21.5625H12.0562C11.8404 20.7681 11.3691 20.0668 10.7151 19.5668C10.0611 19.0668 9.26072 18.7959 8.4375 18.7959C7.61428 18.7959 6.81393 19.0668 6.15993 19.5668C5.50594 20.0668 5.03464 20.7681 4.81875 21.5625H3.75V15.1031C3.74964 14.538 3.91952 13.9859 4.2375 13.5188L6.77812 9.76875C6.86622 9.64498 6.98307 9.54448 7.11862 9.47589C7.25417 9.4073 7.40435 9.37268 7.55625 9.375H15.0562C15.194 9.37478 15.3301 9.4049 15.4548 9.46323C15.5796 9.52157 15.69 9.60667 15.7781 9.7125L18.9656 13.7156C19.0756 13.8489 19.2175 13.9521 19.3781 14.0156L26.25 16.4813V21.5625Z" fill="currentColor"/>
    </svg>
  );
}

/** House icon used on the coverage-type selection tiles. */
function HomeIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.574 2.07551C15.4076 1.94565 15.2026 1.87512 14.9915 1.87512C14.7804 1.87512 14.5754 1.94565 14.409 2.07551L0.9375 12.5808L2.10253 14.0542L3.75 12.7697V24.3751C3.75102 24.872 3.94889 25.3484 4.3003 25.6998C4.65171 26.0512 5.12803 26.249 5.625 26.2501H24.375C24.872 26.2491 25.3484 26.0513 25.6998 25.6999C26.0512 25.3484 26.2491 24.8721 26.25 24.3751V12.7782L27.8975 14.0626L29.0625 12.589L15.574 2.07551ZM16.875 24.3751H13.125V16.8751H16.875V24.3751ZM18.75 24.3751V16.8751C18.7494 16.378 18.5517 15.9014 18.2002 15.5499C17.8487 15.1984 17.3721 15.0006 16.875 15.0001H13.125C12.6279 15.0006 12.1512 15.1983 11.7997 15.5498C11.4482 15.9013 11.2505 16.3779 11.25 16.8751V24.3751H5.625V11.3077L15 4.0046L24.375 11.3176V24.3751H18.75Z" fill="currentColor"/>
    </svg>
  );
}

/** Info-circle icon used inside the dismissible warning banner on Car Details. */
function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip-warn)">
        <path d="M8.125 5.647V8.784M8.125 10.667H8.131M14.4 8C14.4 11.465 11.59 14.274 8.125 14.274C4.66 14.274 1.85 11.465 1.85 8C1.85 4.535 4.66 1.725 8.125 1.725C11.59 1.725 14.4 4.535 14.4 8Z" stroke="#946C00" strokeWidth="1.882" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip-warn">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const navigate = useNavigate();

  // Which step (0-indexed) the user is currently on.
  const [currentStep, setCurrentStep] = useState(0);

  // Controls whether the dismissible yellow warning banner is visible.
  // It resets to true when the page mounts; the user can hide it via Dismiss.
  const [warningVisible, setWarningVisible] = useState(true);

  /**
   * Single source of truth for all form fields across all steps.
   * Keeping everything in one object avoids prop-drilling and makes it
   * straightforward to submit the whole payload at the end of the flow.
   */
  const [formData, setFormData] = useState({
    // Step 0 – Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    altPhone: '',
    dob: '',

    // Step 1 – Coverage Type ('car' | 'home' | 'both' | '')
    coverageType: '',

    // Step 2 – Address
    street: '',
    city: '',
    state: '',
    zip: '',

    // Step 3 – Car Details (shown when coverageType is 'car' or 'both')
    make: '',
    model: '',
    year: '',
    mileage: 1000,
    milesPerYear: 1000,
    vin: '',

    // Step 3 – Home Details (shown when coverageType is 'home' or 'both')
    homeType: '',
    yearBuilt: '',
    squareFeet: 1000,
    homeValue: 1000,
  });

  // Derived booleans that drive conditional rendering in the Details step.
  const showCar = formData.coverageType === 'car' || formData.coverageType === 'both';
  const showHome = formData.coverageType === 'home' || formData.coverageType === 'both';

  /** Generic field updater – avoids writing a separate handler per input. */
  const setField = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // Navigation handlers – clamp so we never go out of bounds.
  const handleNext = () => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setCurrentStep(s => Math.max(s - 1, 0));

  /** Abandon the signup flow and return the user to the landing page. */
  const handleCancel = () => navigate('/');

  // The warning banner appears only on the Car Details step and only while
  // the user has not yet dismissed it.
  const showWarning = currentStep === 3 && showCar && warningVisible;

  // The Cancel button appears only on the Details step when car fields are
  // visible, matching the Figma design (Car Info frame).
  const showCancelOnDetails = currentStep === 3 && showCar;

  // ─────────────────────────────────────────────────────────────────────────
  // Step 0 – Personal Information
  // ─────────────────────────────────────────────────────────────────────────

  const renderPersonalInfo = () => (
    <>
      <div className="signup-form__header">
        <h2 className="signup-form__title">Personal Information</h2>
      </div>
      <p className="signup-form__description">Let's start with some basic information about you.</p>
      <div className="signup-form__fields">
        <TextInput
          id="firstName"
          labelText="First Name"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={e => setField('firstName', e.target.value)}
          size="lg"
        />
        <TextInput
          id="lastName"
          labelText="Last Name"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={e => setField('lastName', e.target.value)}
          size="lg"
        />
        <TextInput
          id="email"
          labelText="Email Address"
          placeholder="your.email@example.com"
          type="email"
          value={formData.email}
          onChange={e => setField('email', e.target.value)}
          size="lg"
        />
        {/* Primary contact number */}
        <TextInput
          id="phone"
          labelText="Phone Number"
          placeholder="(555) 123-4567"
          type="tel"
          value={formData.phone}
          onChange={e => setField('phone', e.target.value)}
          size="lg"
        />
        {/* Secondary / alternate contact number – matches Figma design */}
        <TextInput
          id="altPhone"
          labelText="Phone Number"
          placeholder="(555) 123-4567"
          type="tel"
          value={formData.altPhone}
          onChange={e => setField('altPhone', e.target.value)}
          size="lg"
        />
        {/*
          Carbon's DatePicker wraps Flatpickr. onChange receives an array of
          Date objects; we only care about the first (single-pick mode).
        */}
        <DatePicker
          datePickerType="single"
          onChange={dates => dates[0] && setField('dob', dates[0])}
        >
          <DatePickerInput
            id="dob"
            labelText="Date of Birth"
            placeholder="mm/dd/yyyy"
            size="lg"
          />
        </DatePicker>
      </div>

      {/* First step has no Back button – only Next. */}
      <div className="signup-form__actions signup-form__actions--end">
        <Button kind="primary" renderIcon={ArrowRight} onClick={handleNext} size="lg">
          Next
        </Button>
      </div>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1 – Coverage Type
  // ─────────────────────────────────────────────────────────────────────────

  const renderCoverageType = () => (
    <>
      <div className="signup-form__header">
        <h2 className="signup-form__title">What Will You Insure</h2>
      </div>
      <p className="signup-form__description">Which insurance coverage are you looking for</p>
      <div className="signup-form__fields">
        {/*
          Custom selectable tiles instead of Carbon's RadioTile because we need
          full control over the icon layout and selection highlight styling.
          Only one option can be active at a time (stored in formData.coverageType).
        */}
        <div className="coverage-options">
          {COVERAGE_OPTIONS.map(option => (
            <button
              key={option.id}
              type="button"
              className={`coverage-tile${formData.coverageType === option.id ? ' coverage-tile--selected' : ''}`}
              onClick={() => setField('coverageType', option.id)}
            >
              <div className="coverage-tile__icons">
                {option.showCar && <CarIcon />}
                {option.showHome && <HomeIcon />}
              </div>
              <div className="coverage-tile__text">
                <h3 className="coverage-tile__title">{option.title}</h3>
                <p className="coverage-tile__description">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="signup-form__actions">
        <Button kind="secondary" renderIcon={ArrowLeft} onClick={handleBack} size="lg">
          Back
        </Button>
        <Button kind="primary" renderIcon={ArrowRight} onClick={handleNext} size="lg">
          Next
        </Button>
      </div>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2 – Address
  // ─────────────────────────────────────────────────────────────────────────

  const renderAddress = () => (
    <>
      <div className="signup-form__header">
        <h2 className="signup-form__title">Your Address</h2>
      </div>
      <p className="signup-form__description">Let us know where you live</p>
      <div className="signup-form__fields">
        <TextInput
          id="street"
          labelText="Street Address"
          placeholder="123 Main Street"
          value={formData.street}
          onChange={e => setField('street', e.target.value)}
          size="lg"
        />
        <TextInput
          id="city"
          labelText="City"
          placeholder="Your city"
          value={formData.city}
          onChange={e => setField('city', e.target.value)}
          size="lg"
        />
        {/* Native <select> rendered via Carbon's Select / SelectItem wrappers. */}
        <Select
          id="state"
          labelText="State"
          value={formData.state}
          onChange={e => setField('state', e.target.value)}
          size="lg"
        >
          <SelectItem value="" text="" />
          {US_STATES.map(s => (
            <SelectItem key={s} value={s} text={s} />
          ))}
        </Select>
        <TextInput
          id="zip"
          labelText="Zip"
          placeholder="(555) 123-4567"
          value={formData.zip}
          onChange={e => setField('zip', e.target.value)}
          size="lg"
        />
      </div>
      <div className="signup-form__actions">
        <Button kind="secondary" renderIcon={ArrowLeft} onClick={handleBack} size="lg">
          Back
        </Button>
        <Button kind="primary" renderIcon={ArrowRight} onClick={handleNext} size="lg">
          Next
        </Button>
      </div>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3 – Details (Car and/or Home, conditional on coverage selection)
  // ─────────────────────────────────────────────────────────────────────────

  const renderDetails = () => (
    <>
      {/* ── Car Details section ── */}
      {showCar && (
        <>
          <div className="signup-form__header">
            <h2 className="signup-form__title">Car Details</h2>
          </div>
          <p className="signup-form__description">Tell us about your car</p>
          <div className="signup-form__fields">
            <TextInput
              id="make"
              labelText="Make"
              placeholder="e.g. Toyota, Ford"
              value={formData.make}
              onChange={e => setField('make', e.target.value)}
              size="lg"
            />
            <TextInput
              id="model"
              labelText="Model"
              placeholder="e.g. Corolla, Bronco"
              value={formData.model}
              onChange={e => setField('model', e.target.value)}
              size="lg"
            />
            {/* Year range: current year down to 35 years ago. */}
            <Select
              id="year"
              labelText="Year"
              value={formData.year}
              onChange={e => setField('year', e.target.value)}
              size="lg"
            >
              <SelectItem value="" text="" />
              {CAR_YEARS.map(y => (
                <SelectItem key={y} value={String(y)} text={String(y)} />
              ))}
            </Select>
            {/*
              Carbon NumberInput calls onChange with (event, { value, direction }).
              We only need `value` (the new numeric value after the +/– click or
              manual entry).
            */}
            <NumberInput
              id="mileage"
              label="Mileage"
              value={formData.mileage}
              min={0}
              step={1000}
              onChange={(e, { value }) => setField('mileage', value)}
              size="lg"
            />
            <NumberInput
              id="milesPerYear"
              label="Miles driven per year"
              value={formData.milesPerYear}
              min={0}
              step={1000}
              onChange={(e, { value }) => setField('milesPerYear', value)}
              size="lg"
            />
            {/* VIN is optional – helper text reminds the user it must be 17 chars. */}
            <TextInput
              id="vin"
              labelText="VIN (optional)"
              placeholder=""
              helperText="17 digits"
              value={formData.vin}
              onChange={e => setField('vin', e.target.value)}
              size="lg"
            />
          </div>
        </>
      )}

      {/* ── Home / Property Details section ── */}
      {showHome && (
        <>
          {/* Visual separator when both car and home sections are visible */}
          {showCar && <div className="signup-form__section-divider" />}
          <div className="signup-form__header">
            <h2 className="signup-form__title">Property Details</h2>
          </div>
          <p className="signup-form__description">Tell us about your home</p>
          <div className="signup-form__fields">
            <Select
              id="homeType"
              labelText="Home Type"
              value={formData.homeType}
              onChange={e => setField('homeType', e.target.value)}
              size="lg"
            >
              <SelectItem value="" text="" />
              {HOME_TYPES.map(t => (
                <SelectItem key={t} value={t} text={t} />
              ))}
            </Select>
            {/* Year range: 1800 – 2025 to cover all insurable construction years. */}
            <Select
              id="yearBuilt"
              labelText="Year Built"
              value={formData.yearBuilt}
              onChange={e => setField('yearBuilt', e.target.value)}
              size="lg"
            >
              <SelectItem value="" text="" />
              {HOME_YEARS.map(y => (
                <SelectItem key={y} value={String(y)} text={String(y)} />
              ))}
            </Select>
            <NumberInput
              id="squareFeet"
              label="Square Feet"
              helperText="We'll confirm this more accurately later"
              value={formData.squareFeet}
              min={0}
              step={100}
              onChange={(e, { value }) => setField('squareFeet', value)}
              size="lg"
            />
            <NumberInput
              id="homeValue"
              label="Estimated Home Value"
              helperText="We'll confirm this more accurately later"
              value={formData.homeValue}
              min={0}
              step={1000}
              onChange={(e, { value }) => setField('homeValue', value)}
              size="lg"
            />
          </div>
        </>
      )}

      {/* Fallback: user skipped step 1 and arrived here without choosing coverage. */}
      {!showCar && !showHome && (
        <div className="signup-form__empty-details">
          <p>Please go back and select a coverage type first.</p>
        </div>
      )}

      <div className="signup-form__actions">
        {/*
          Cancel is only shown on the Details step when car fields are visible,
          matching the Figma "Car Info" frame. It abandons the flow entirely.
        */}
        {showCancelOnDetails && (
          <Button kind="tertiary" onClick={handleCancel} size="lg">
            Cancel
          </Button>
        )}
        <Button kind="secondary" renderIcon={ArrowLeft} onClick={handleBack} size="lg">
          Back
        </Button>
        <Button kind="primary" renderIcon={ArrowRight} onClick={handleNext} size="lg">
          Next
        </Button>
      </div>
    </>
  );

  // Map each step index to its render function for clean dispatch below.
  const stepRenderers = [
    renderPersonalInfo,
    renderCoverageType,
    renderAddress,
    renderDetails,
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="signup-page">
      <div className="signup-wrapper">

        {/* ── Gradient outer area: brand header + step progress ── */}
        <div className="signup-outer">
          <div className="signup-header">
            <h1 className="signup-header__title">Sign Up for InsureCo</h1>
            <p className="signup-header__subtitle">
              Get started with your insurance coverage in just a few steps
            </p>
          </div>

          {/* StepBreadcrumb is the project's custom progress indicator
              (Carbon's ProgressIndicator is banned due to theming issues –
              see .builder/rules/banned-components.mdc). */}
          <div className="signup-progress">
            <StepBreadcrumb steps={STEPS} currentIndex={currentStep} />
          </div>
        </div>

        {/* ── Dismissible warning banner (Car Details step only) ── */}
        {showWarning && (
          <div className="signup-warning" role="alert">
            <div className="signup-warning__content">
              <WarningIcon />
              <span className="signup-warning__message">This is a warning message</span>
            </div>
            <button
              type="button"
              className="signup-warning__dismiss"
              onClick={() => setWarningVisible(false)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── Main form card – renders the active step ── */}
        <div className="signup-form">
          {stepRenderers[currentStep]()}
        </div>

      </div>
    </div>
  );
}
