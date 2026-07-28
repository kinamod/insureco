import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Column,
  Form,
  Stack,
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  Button,
  TileGroup,
  RadioTile,
  InlineNotification,
} from '@carbon/react';
import { ArrowLeft, ArrowRight, Checkmark, Car, Home } from '@carbon/icons-react';
import StepBreadcrumb from '../components/StepBreadcrumb';
import './SignUpPage.scss';

const STEP_META = {
  personal: { key: 'personal', label: 'Personal Info' },
  address: { key: 'address', label: 'Address' },
  insurance: { key: 'insurance', label: 'Insurance Type' },
  car: { key: 'car', label: 'Car Details' },
  home: { key: 'home', label: 'Home Details' },
};

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY',
];

const CAR_YEARS = Array.from({ length: 2026 - 1980 + 1 }, (_, i) => 2026 - i);
const HOME_YEARS = Array.from({ length: 2025 - 1800 + 1 }, (_, i) => 2025 - i);

const HOME_TYPES = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Mobile Home'];

const INITIAL_FORM_DATA = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  phone2: '',
  dateOfBirth: '',

  streetAddress: '',
  city: '',
  state: '',
  zip: '',

  insuranceType: '',

  carMake: '',
  carModel: '',
  carYear: '',
  carMileage: 1000,
  carMilesPerYear: 1000,
  carVin: '',

  homeType: '',
  homeYearBuilt: '',
  homeSquareFeet: 1000,
  homeValue: 1000,
};

function getSteps(insuranceType) {
  const steps = ['personal', 'address', 'insurance'];
  if (insuranceType === 'car' || insuranceType === 'both') steps.push('car');
  if (insuranceType === 'home' || insuranceType === 'both') steps.push('home');
  return steps;
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [showCarWarning, setShowCarWarning] = useState(true);

  const steps = useMemo(() => getSteps(formData.insuranceType), [formData.insuranceType]);
  const safeIndex = Math.min(currentStepIndex, steps.length - 1);
  const currentStepKey = steps[safeIndex];
  const isFirstStep = safeIndex === 0;
  const isLastStep = safeIndex === steps.length - 1;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [safeIndex]);

  const updateField = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const updateNumberField = (field) => (e, meta) => {
    setFormData((prev) => ({ ...prev, [field]: meta?.value ?? e.target.value }));
  };

  const isStepValid = (stepKey) => {
    switch (stepKey) {
      case 'personal':
        return Boolean(formData.firstName && formData.lastName && formData.email && formData.phone);
      case 'address':
        return Boolean(formData.streetAddress && formData.city && formData.state && formData.zip);
      case 'insurance':
        return Boolean(formData.insuranceType);
      case 'car':
        return Boolean(formData.carMake && formData.carModel && formData.carYear);
      case 'home':
        return Boolean(formData.homeType && formData.homeYearBuilt);
      default:
        return true;
    }
  };

  const handleBack = () => {
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!isStepValid(currentStepKey)) return;

    if (isLastStep) {
      // Mock submission - would POST to backend API in production
      console.log('Sign up form submitted', formData);
      navigate('/dashboard');
      return;
    }
    setCurrentStepIndex((i) => i + 1);
  };

  const stepBreadcrumbItems = steps.map((key) => ({ key, label: STEP_META[key].label }));

  return (
    <Grid fullWidth className="signup-page">
      <Column sm={4} md={8} lg={{ span: 10, offset: 3 }}>
        <div className="signup-card">
          <div className="signup-hero">
            <h1 className="signup-hero__title">Sign Up for InsureCo</h1>
            <p className="signup-hero__subtitle">
              Get started with your insurance coverage in just a few steps
            </p>
          </div>

          <div className="signup-progress">
            <StepBreadcrumb steps={stepBreadcrumbItems} currentIndex={safeIndex} />
          </div>

          {currentStepKey === 'car' && showCarWarning && (
            <InlineNotification
              kind="warning"
              lowContrast
              title="This is a warning message"
              className="signup-alert"
              onCloseButtonClick={() => setShowCarWarning(false)}
              aria-label="Dismiss warning notification"
              statusIconDescription="warning"
            />
          )}

          <div className="signup-body">
            <Form onSubmit={handleNext}>
              {currentStepKey === 'personal' && (
                <div className="signup-step">
                  <div className="signup-step__header">
                    <h2 className="signup-step__title">Personal Information</h2>
                    <p className="signup-step__description">
                      Let's start with some basic information about you.
                    </p>
                  </div>
                  <Stack gap={6} className="signup-fields">
                    <TextInput
                      id="firstName"
                      size="lg"
                      labelText="First Name"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={updateField('firstName')}
                    />
                    <TextInput
                      id="lastName"
                      size="lg"
                      labelText="Last Name"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={updateField('lastName')}
                    />
                    <TextInput
                      id="email"
                      size="lg"
                      type="email"
                      labelText="Email Address"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={updateField('email')}
                    />
                    <TextInput
                      id="phone"
                      size="lg"
                      type="tel"
                      labelText="Phone Number"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={updateField('phone')}
                    />
                    <TextInput
                      id="phone2"
                      size="lg"
                      type="tel"
                      labelText="Phone Number"
                      placeholder="(555) 123-4567"
                      value={formData.phone2}
                      onChange={updateField('phone2')}
                    />
                    <TextInput
                      id="dateOfBirth"
                      size="lg"
                      type="date"
                      labelText="Date of Birth"
                      placeholder="mm/dd/yyyy"
                      value={formData.dateOfBirth}
                      onChange={updateField('dateOfBirth')}
                    />
                  </Stack>
                </div>
              )}

              {currentStepKey === 'address' && (
                <div className="signup-step">
                  <div className="signup-step__header">
                    <h2 className="signup-step__title">Your Address</h2>
                    <p className="signup-step__description">Let us know where you live</p>
                  </div>
                  <Stack gap={6} className="signup-fields">
                    <TextInput
                      id="streetAddress"
                      size="lg"
                      labelText="Street Address"
                      placeholder="123 Main Street"
                      value={formData.streetAddress}
                      onChange={updateField('streetAddress')}
                    />
                    <TextInput
                      id="city"
                      size="lg"
                      labelText="City"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={updateField('city')}
                    />
                    <Select
                      id="state"
                      size="lg"
                      labelText="State"
                      value={formData.state}
                      onChange={updateField('state')}
                    >
                      <SelectItem value="" text="" />
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state} text={state} />
                      ))}
                    </Select>
                    <TextInput
                      id="zip"
                      size="lg"
                      labelText="Zip"
                      placeholder="(555) 123-4567"
                      value={formData.zip}
                      onChange={updateField('zip')}
                    />
                  </Stack>
                </div>
              )}

              {currentStepKey === 'insurance' && (
                <div className="signup-step">
                  <div className="signup-step__header">
                    <h2 className="signup-step__title">What Will You Insure</h2>
                    <p className="signup-step__description">
                      Which insurance coverage are you looking for
                    </p>
                  </div>
                  <TileGroup
                    name="insurance-type"
                    className="insurance-tile-group"
                    valueSelected={formData.insuranceType}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, insuranceType: value }))
                    }
                  >
                    <RadioTile value="car" id="insurance-type-car" className="insurance-tile">
                      <div className="insurance-tile__content">
                        <Car size={30} className="insurance-tile__icon" />
                        <div className="insurance-tile__text">
                          <div className="insurance-tile__title">Car Insurance</div>
                          <div className="insurance-tile__description">
                            Get comprehensive coverage for your vehicle
                          </div>
                        </div>
                      </div>
                    </RadioTile>
                    <RadioTile value="home" id="insurance-type-home" className="insurance-tile">
                      <div className="insurance-tile__content">
                        <Home size={30} className="insurance-tile__icon" />
                        <div className="insurance-tile__text">
                          <div className="insurance-tile__title">Home Insurance</div>
                          <div className="insurance-tile__description">
                            Protect your most important asset for your family
                          </div>
                        </div>
                      </div>
                    </RadioTile>
                    <RadioTile value="both" id="insurance-type-both" className="insurance-tile">
                      <div className="insurance-tile__content">
                        <div className="insurance-tile__icon-group">
                          <Car size={30} className="insurance-tile__icon" />
                          <Home size={30} className="insurance-tile__icon" />
                        </div>
                        <div className="insurance-tile__text">
                          <div className="insurance-tile__title">Both Home and Car</div>
                          <div className="insurance-tile__description">
                            Insure both and get bundle savings
                          </div>
                        </div>
                      </div>
                    </RadioTile>
                  </TileGroup>
                </div>
              )}

              {currentStepKey === 'car' && (
                <div className="signup-step">
                  <div className="signup-step__header">
                    <h2 className="signup-step__title">Car Details</h2>
                    <p className="signup-step__description">Tell us about your car</p>
                  </div>
                  <Stack gap={6} className="signup-fields">
                    <TextInput
                      id="carMake"
                      size="lg"
                      labelText="Make"
                      placeholder="e.g. Toyota, Ford"
                      value={formData.carMake}
                      onChange={updateField('carMake')}
                    />
                    <TextInput
                      id="carModel"
                      size="lg"
                      labelText="Model"
                      placeholder="e.g. Corolla, Bronco"
                      value={formData.carModel}
                      onChange={updateField('carModel')}
                    />
                    <Select
                      id="carYear"
                      size="lg"
                      labelText="Year"
                      value={formData.carYear}
                      onChange={updateField('carYear')}
                    >
                      <SelectItem value="" text="" />
                      {CAR_YEARS.map((year) => (
                        <SelectItem key={year} value={String(year)} text={String(year)} />
                      ))}
                    </Select>
                    <NumberInput
                      id="carMileage"
                      size="lg"
                      label="Mileage"
                      value={formData.carMileage}
                      onChange={updateNumberField('carMileage')}
                      min={0}
                      step={1000}
                    />
                    <NumberInput
                      id="carMilesPerYear"
                      size="lg"
                      label="Miles driven per year"
                      value={formData.carMilesPerYear}
                      onChange={updateNumberField('carMilesPerYear')}
                      min={0}
                      step={1000}
                    />
                    <TextInput
                      id="carVin"
                      size="lg"
                      labelText="VIN (optional)"
                      helperText="17 digits"
                      value={formData.carVin}
                      onChange={updateField('carVin')}
                    />
                  </Stack>
                </div>
              )}

              {currentStepKey === 'home' && (
                <div className="signup-step">
                  <div className="signup-step__header">
                    <h2 className="signup-step__title">Property Details</h2>
                    <p className="signup-step__description">Tell us about your car</p>
                  </div>
                  <Stack gap={6} className="signup-fields">
                    <Select
                      id="homeType"
                      size="lg"
                      labelText="Home Type"
                      value={formData.homeType}
                      onChange={updateField('homeType')}
                    >
                      <SelectItem value="" text="" />
                      {HOME_TYPES.map((type) => (
                        <SelectItem key={type} value={type} text={type} />
                      ))}
                    </Select>
                    <Select
                      id="homeYearBuilt"
                      size="lg"
                      labelText="Year Built"
                      value={formData.homeYearBuilt}
                      onChange={updateField('homeYearBuilt')}
                    >
                      <SelectItem value="" text="" />
                      {HOME_YEARS.map((year) => (
                        <SelectItem key={year} value={String(year)} text={String(year)} />
                      ))}
                    </Select>
                    <NumberInput
                      id="homeSquareFeet"
                      size="lg"
                      label="Square Feet"
                      helperText="We'll confirm this more accurately later"
                      value={formData.homeSquareFeet}
                      onChange={updateNumberField('homeSquareFeet')}
                      min={0}
                      step={100}
                    />
                    <NumberInput
                      id="homeValue"
                      size="lg"
                      label="Estimated Home Value"
                      helperText="We'll confirm this more accurately later"
                      value={formData.homeValue}
                      onChange={updateNumberField('homeValue')}
                      min={0}
                      step={1000}
                    />
                  </Stack>
                </div>
              )}

              <div className="signup-actions">
                {currentStepKey === 'car' && (
                  <Button kind="tertiary" onClick={() => navigate('/')}>
                    Cancel
                  </Button>
                )}
                {!isFirstStep && (
                  <Button kind="secondary" renderIcon={ArrowLeft} onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  kind="primary"
                  renderIcon={isLastStep ? Checkmark : ArrowRight}
                  disabled={!isStepValid(currentStepKey)}
                >
                  {isLastStep ? 'Complete Sign Up' : 'Next'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Column>
    </Grid>
  );
}
