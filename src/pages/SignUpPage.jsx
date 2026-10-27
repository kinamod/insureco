import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  DatePicker,
  DatePickerInput,
  Form,
  InlineNotification,
  NumberInput,
  RadioTile,
  Select,
  SelectItem,
  Stack,
  TextInput,
  TileGroup,
} from '@carbon/react';
import { ArrowLeft, ArrowRight, Car, Checkmark, Home } from '@carbon/icons-react';
import StepBreadcrumb from '../components/StepBreadcrumb';
import './SignUpPage.scss';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY',
];
const CAR_YEARS = Array.from({ length: 2026 - 1980 + 1 }, (_, i) => String(2026 - i));
const HOME_YEARS = Array.from({ length: 2025 - 1800 + 1 }, (_, i) => String(2025 - i));
const HOME_TYPES = ['Single-family house', 'Condo', 'Townhouse', 'Apartment', 'Mobile home'];

const INITIAL_DATA = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  insuranceType: '',
  carMake: '',
  carModel: '',
  carYear: '',
  carMileage: 1000,
  carMilesPerYear: 1000,
  carVin: '',
  homeType: '',
  homeYear: '',
  homeSquareFeet: 1000,
  homeValue: 1000,
};

const REQUIRED_FIELDS = {
  personal: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'],
  address: ['streetAddress', 'city', 'state', 'zipCode'],
  type: ['insuranceType'],
  car: ['carMake', 'carModel', 'carYear'],
  home: ['homeType', 'homeYear'],
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [showWarning, setShowWarning] = useState(true);

  const steps = useMemo(() => {
    const list = [
      { key: 'personal', label: 'Personal Info' },
      { key: 'address', label: 'Address' },
      { key: 'type', label: 'Insurance Type' },
    ];
    if (formData.insuranceType === 'car' || formData.insuranceType === 'both') {
      list.push({ key: 'car', label: 'Car Info' });
    }
    if (formData.insuranceType === 'home' || formData.insuranceType === 'both') {
      list.push({ key: 'home', label: 'Home Info' });
    }
    return list;
  }, [formData.insuranceType]);

  const stepKey = steps[currentStep].key;
  const isLastStep = currentStep === steps.length - 1;
  const isValid = REQUIRED_FIELDS[stepKey].every((field) => String(formData[field]).trim() !== '');

  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const onText = (field) => (e) => update(field, e.target.value);
  const onNumber = (field) => (e, { value }) => update(field, value);

  const goTo = (index) => {
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!isValid) return;
    if (isLastStep) {
      console.log('Sign up submitted', formData);
      navigate('/dashboard');
      return;
    }
    goTo(currentStep + 1);
  };

  const renderStep = () => {
    switch (stepKey) {
      case 'personal':
        return (
          <Stack gap={6}>
            <TextInput id="firstName" labelText="First Name" placeholder="Enter your first name" value={formData.firstName} onChange={onText('firstName')} />
            <TextInput id="lastName" labelText="Last Name" placeholder="Enter your last name" value={formData.lastName} onChange={onText('lastName')} />
            <TextInput id="email" type="email" labelText="Email Address" placeholder="your.email@example.com" value={formData.email} onChange={onText('email')} />
            <TextInput id="phone" type="tel" labelText="Phone Number" placeholder="(555) 123-4567" value={formData.phone} onChange={onText('phone')} />
            <DatePicker
              datePickerType="single"
              dateFormat="m/d/Y"
              value={formData.dateOfBirth}
              onChange={(dates, str) => update('dateOfBirth', str)}
            >
              <DatePickerInput id="dateOfBirth" labelText="Date of Birth" placeholder="mm/dd/yyyy" />
            </DatePicker>
          </Stack>
        );
      case 'address':
        return (
          <Stack gap={6}>
            <TextInput id="streetAddress" labelText="Street Address" placeholder="123 Main Street" value={formData.streetAddress} onChange={onText('streetAddress')} />
            <TextInput id="city" labelText="City" placeholder="Your city" value={formData.city} onChange={onText('city')} />
            <div className="signup-page__half">
              <Select id="state" labelText="State" value={formData.state} onChange={onText('state')}>
                <SelectItem value="" text="" />
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s} text={s} />
                ))}
              </Select>
            </div>
            <TextInput id="zipCode" labelText="Zip" placeholder="12345" value={formData.zipCode} onChange={onText('zipCode')} />
          </Stack>
        );
      case 'type':
        return (
          <TileGroup
            legend="Insurance type"
            name="insuranceType"
            valueSelected={formData.insuranceType}
            onChange={(value) => update('insuranceType', value)}
            className="signup-page__tiles"
          >
            <RadioTile value="car" id="type-car">
              <span className="signup-page__tile">
                <span className="signup-page__tile-icons"><Car size={32} /></span>
                <span>
                  <span className="signup-page__tile-title">Car Insurance</span>
                  <span className="signup-page__tile-text">Get comprehensive coverage for your vehicle</span>
                </span>
              </span>
            </RadioTile>
            <RadioTile value="home" id="type-home">
              <span className="signup-page__tile">
                <span className="signup-page__tile-icons"><Home size={32} /></span>
                <span>
                  <span className="signup-page__tile-title">Home Insurance</span>
                  <span className="signup-page__tile-text">Protect your most important asset for your family</span>
                </span>
              </span>
            </RadioTile>
            <RadioTile value="both" id="type-both">
              <span className="signup-page__tile">
                <span className="signup-page__tile-icons"><Car size={32} /><Home size={32} /></span>
                <span>
                  <span className="signup-page__tile-title">Both Home and Car</span>
                  <span className="signup-page__tile-text">Insure both and get bundle savings</span>
                </span>
              </span>
            </RadioTile>
          </TileGroup>
        );
      case 'car':
        return (
          <Stack gap={6}>
            <TextInput id="carMake" labelText="Make" placeholder="e.g. Toyota, Ford" value={formData.carMake} onChange={onText('carMake')} />
            <TextInput id="carModel" labelText="Model" placeholder="e.g. Corolla, Bronco" value={formData.carModel} onChange={onText('carModel')} />
            <Select id="carYear" labelText="Year" value={formData.carYear} onChange={onText('carYear')}>
              <SelectItem value="" text="" />
              {CAR_YEARS.map((y) => (
                <SelectItem key={y} value={y} text={y} />
              ))}
            </Select>
            <NumberInput id="carMileage" label="Mileage" min={0} step={1000} value={formData.carMileage} onChange={onNumber('carMileage')} />
            <NumberInput id="carMilesPerYear" label="Miles driven per year" min={0} step={1000} value={formData.carMilesPerYear} onChange={onNumber('carMilesPerYear')} />
            <TextInput id="carVin" labelText="VIN (optional)" helperText="17 digits" maxLength={17} value={formData.carVin} onChange={onText('carVin')} />
          </Stack>
        );
      case 'home':
        return (
          <Stack gap={6}>
            <Select id="homeType" labelText="Home Type" value={formData.homeType} onChange={onText('homeType')}>
              <SelectItem value="" text="" />
              {HOME_TYPES.map((t) => (
                <SelectItem key={t} value={t} text={t} />
              ))}
            </Select>
            <Select id="homeYear" labelText="Year Built" value={formData.homeYear} onChange={onText('homeYear')}>
              <SelectItem value="" text="" />
              {HOME_YEARS.map((y) => (
                <SelectItem key={y} value={y} text={y} />
              ))}
            </Select>
            <NumberInput id="homeSquareFeet" label="Square Feet" helperText="We'll confirm this more accurately later" min={0} step={100} value={formData.homeSquareFeet} onChange={onNumber('homeSquareFeet')} />
            <NumberInput id="homeValue" label="Estimated Home Value" helperText="We'll confirm this more accurately later" min={0} step={1000} value={formData.homeValue} onChange={onNumber('homeValue')} />
          </Stack>
        );
      default:
        return null;
    }
  };

  const headings = {
    personal: ['Personal Information', "Let's start with some basic information about you."],
    address: ['Your Address', 'Let us know where you live'],
    type: ['What Will You Insure', 'Which insurance coverage are you looking for'],
    car: ['Car Details', 'Tell us about your car'],
    home: ['Property Details', 'Tell us about your home'],
  };
  const [title, description] = headings[stepKey];

  return (
    <div className="signup-page">
      <div className="signup-page__container">
        <header className="signup-page__header">
          <h1>Sign Up for InsureCo</h1>
          <p>Get started with your insurance coverage in just a few steps</p>
        </header>

        <div className="signup-page__progress">
          <StepBreadcrumb steps={steps} currentIndex={currentStep} />
        </div>

        {stepKey === 'car' && showWarning && (
          <InlineNotification
            kind="warning"
            lowContrast
            title="Heads up:"
            subtitle="Make sure these details match your vehicle registration."
            onCloseButtonClick={() => setShowWarning(false)}
            className="signup-page__alert"
          />
        )}

        <Form className="signup-page__card" onSubmit={(e) => e.preventDefault()}>
          <h2 className="signup-page__title">{title}</h2>
          <p className="signup-page__description">{description}</p>
          {renderStep()}

          <div className="signup-page__actions">
            {stepKey === 'car' && (
              <Button kind="tertiary" onClick={() => navigate('/')}>
                Cancel
              </Button>
            )}
            {currentStep > 0 && (
              <Button kind="secondary" renderIcon={ArrowLeft} onClick={() => goTo(currentStep - 1)}>
                Back
              </Button>
            )}
            <Button kind="primary" renderIcon={isLastStep ? Checkmark : ArrowRight} disabled={!isValid} onClick={handleNext}>
              {isLastStep ? 'Complete' : 'Next'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
