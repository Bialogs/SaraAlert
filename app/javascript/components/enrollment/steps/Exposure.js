import React from 'react';
import { Card, Button, Form, Col } from 'react-bootstrap';
import { countryOptions } from '../../data';
import { PropTypes } from 'prop-types';
import * as yup from 'yup';
import confirmDialog from '../../util/ConfirmDialog';

class Exposure extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.props,
      current: { ...this.props.currentState },
      errors: {},
      modified: {},
      jurisdictionPath: this.props.jurisdictionPaths[this.props.currentState.patient.jurisdiction_id],
      originalJurisdictionId: this.props.currentState.patient.jurisdiction_id,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handlePropagatedFieldChange = this.handlePropagatedFieldChange.bind(this);
    this.validate = this.validate.bind(this);
  }

  handleChange(event) {
    let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    let current = this.state.current;
    let modified = this.state.modified;
    value = event.target.type === 'date' && value === '' ? undefined : value;
    if (event?.target?.name && event.target.name === 'jurisdictionId') {
      this.setState({ jurisdictionPath: event.target.value });
      let jurisdiction_id = Object.keys(this.props.jurisdictionPaths).find(id => this.props.jurisdictionPaths[parseInt(id)] === event.target.value);
      value = jurisdiction_id ? jurisdiction_id : -1;
    }
    this.setState(
      {
        current: { ...current, patient: { ...current.patient, [event.target.id]: value } },
        modified: { ...modified, patient: { ...modified.patient, [event.target.id]: value } },
      },
      () => {
        this.props.setEnrollmentState({ ...this.state.modified });
      }
    );
  }

  handlePropagatedFieldChange(event) {
    let current = this.state.current;
    let modified = this.state.modified;
    this.setState(
      {
        current: { ...current, propagatedFields: { ...current.propagatedFields, [event.target.name]: event.target.checked } },
        modified: { ...modified, propagatedFields: { ...current.propagatedFields, [event.target.name]: event.target.checked } },
      },
      () => {
        this.props.setEnrollmentState({ ...this.state.modified });
      }
    );
  }

  validate(callback) {
    let self = this;
    schema
      .validate({ ...this.state.current.patient }, { abortEarly: false })
      .then(function() {
        // No validation issues? Invoke callback (move to next step)
        self.setState({ errors: {} }, async () => {
          if (self.state.current.patient.jurisdiction_id !== self.state.originalJurisdictionId) {
            const originalJurisdictionPath = self.props.jurisdictionPaths[self.state.originalJurisdictionId];
            const message = `You are about to change the assigned jurisdiction from ${originalJurisdictionPath} to ${self.state.jurisdictionPath}. Are you sure you want to do this?`;
            if (await confirmDialog(message)) {
              callback();
            }
          } else {
            callback();
          }
        });
      })
      .catch(err => {
        // Validation errors, update state to display to user
        if (err && err.inner) {
          let issues = {};
          for (var issue of err.inner) {
            issues[issue['path']] = issue['errors'];
          }
          self.setState({ errors: issues });
        }
      });
  }

  render() {
    return (
      <React.Fragment>
        <Card className="mx-2 card-square">
          <Card.Header as="h5">Monitoree Potential Exposure Information</Card.Header>
          <Card.Body>
            <Form>
              <Form.Row>
                <Form.Group as={Col} md="7" controlId="last_date_of_exposure">
                  <Form.Label className="nav-input-label">
                    LAST DATE OF EXPOSURE{schema?.fields?.last_date_of_exposure?._exclusive?.required && ' *'}
                  </Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['last_date_of_exposure']}
                    size="lg"
                    type="date"
                    className="form-square"
                    value={this.state.current.patient.last_date_of_exposure || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['last_date_of_exposure']}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="10" controlId="potential_exposure_location">
                  <Form.Label className="nav-input-label">
                    EXPOSURE LOCATION{schema?.fields?.potential_exposure_location?._exclusive?.required && ' *'}
                  </Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['potential_exposure_location']}
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.potential_exposure_location || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['potential_exposure_location']}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="7" controlId="potential_exposure_country">
                  <Form.Label className="nav-input-label">
                    EXPOSURE COUNTRY{schema?.fields?.potential_exposure_country?._exclusive?.required && ' *'}
                  </Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['potential_exposure_country']}
                    as="select"
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.potential_exposure_country || ''}
                    onChange={this.handleChange}>
                    <option></option>
                    {countryOptions.map((country, index) => (
                      <option key={`country-${index}`}>{country}</option>
                    ))}
                  </Form.Control>
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['potential_exposure_country']}
                  </Form.Control.Feedback>
                </Form.Group>
              </Form.Row>
              <Form.Row className="pt-3 pb-4 h-100">
                <Form.Group as={Col} className="my-auto">
                  <Form.Label className="nav-input-label pb-4">EXPOSURE RISK FACTORS (USE COMMAS TO SEPERATE MULTIPLE SPECIFIED VALUES)</Form.Label>
                  <Form.Row className="pb-2">
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto">
                      <Form.Check
                        type="switch"
                        id="contact_of_known_case"
                        label="CLOSE CONTACT WITH A KNOWN CASE"
                        checked={this.state.current.patient.contact_of_known_case === true || false}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto ml-4">
                      <Form.Control
                        size="sm"
                        className="form-square"
                        id="contact_of_known_case_id"
                        placeholder="enter case ID"
                        value={this.state.current.patient.contact_of_known_case_id || ''}
                        onChange={this.handleChange}
                      />
                      <Form.Control.Feedback className="d-block" type="invalid">
                        {this.state.errors['contact_of_known_case_id']}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row className="pb-2">
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto">
                      <Form.Check
                        className="pt-2 my-auto"
                        type="switch"
                        id="travel_to_affected_country_or_area"
                        label="TRAVEL FROM AFFECTED COUNTRY OR AREA"
                        checked={this.state.current.patient.travel_to_affected_country_or_area === true || false}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row className="pb-2">
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto">
                      <Form.Check
                        className="pt-2 my-auto"
                        type="switch"
                        id="was_in_health_care_facility_with_known_cases"
                        label="WAS IN HEALTH CARE FACILITY WITH KNOWN CASES"
                        checked={this.state.current.patient.was_in_health_care_facility_with_known_cases === true || false}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto ml-4">
                      <Form.Control
                        size="sm"
                        className="form-square"
                        id="was_in_health_care_facility_with_known_cases_facility_name"
                        placeholder="enter facility name"
                        value={this.state.current.patient.was_in_health_care_facility_with_known_cases_facility_name || ''}
                        onChange={this.handleChange}
                      />
                      <Form.Control.Feedback className="d-block" type="invalid">
                        {this.state.errors['was_in_health_care_facility_with_known_cases_facility_name']}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row className="pb-2">
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto">
                      <Form.Check
                        className="pt-2 my-auto"
                        type="switch"
                        id="laboratory_personnel"
                        label="LABORATORY PERSONNEL"
                        checked={this.state.current.patient.laboratory_personnel === true || false}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto ml-4">
                      <Form.Control
                        size="sm"
                        className="form-square"
                        id="laboratory_personnel_facility_name"
                        placeholder="enter facility name"
                        value={this.state.current.patient.laboratory_personnel_facility_name || ''}
                        onChange={this.handleChange}
                      />
                      <Form.Control.Feedback className="d-block" type="invalid">
                        {this.state.errors['laboratory_personnel_facility_name']}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row className="pb-2">
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto">
                      <Form.Check
                        className="pt-2 my-auto"
                        type="switch"
                        id="healthcare_personnel"
                        label="HEALTHCARE PERSONNEL"
                        checked={this.state.current.patient.healthcare_personnel === true || false}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto ml-4">
                      <Form.Control
                        size="sm"
                        className="form-square"
                        id="healthcare_personnel_facility_name"
                        placeholder="enter facility name"
                        value={this.state.current.patient.healthcare_personnel_facility_name || ''}
                        onChange={this.handleChange}
                      />
                      <Form.Control.Feedback className="d-block" type="invalid">
                        {this.state.errors['healthcare_personnel_facility_name']}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row className="pb-2">
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto">
                      <Form.Check
                        className="pt-2 my-auto"
                        type="switch"
                        id="crew_on_passenger_or_cargo_flight"
                        label="CREW ON PASSENGER OR CARGO FLIGHT"
                        checked={this.state.current.patient.crew_on_passenger_or_cargo_flight === true || false}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row className="pb-2">
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto">
                      <Form.Check
                        type="switch"
                        id="member_of_a_common_exposure_cohort"
                        label="MEMBER OF A COMMON EXPOSURE COHORT"
                        checked={this.state.current.patient.member_of_a_common_exposure_cohort === true || false}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group as={Col} md="auto" className="mb-0 my-auto ml-4">
                      <Form.Control
                        size="sm"
                        className="form-square"
                        id="member_of_a_common_exposure_cohort_type"
                        placeholder="enter description"
                        value={this.state.current.patient.member_of_a_common_exposure_cohort_type || ''}
                        onChange={this.handleChange}
                      />
                      <Form.Control.Feedback className="d-block" type="invalid">
                        {this.state.errors['member_of_a_common_exposure_cohort_type']}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row className="pt-4 g-border-bottom-2" />
                  <Form.Row className="pt-3">
                    <Form.Group as={Col}>
                      <Form.Label className="nav-input-label">PUBLIC HEALTH RISK ASSESSMENT AND MANAGEMENT</Form.Label>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row className="pt-3">
                    <Form.Group as={Col} md="8" controlId="exposure_risk_assessment">
                      <Form.Label className="nav-input-label">
                        EXPOSURE RISK ASSESSMENT{schema?.fields?.exposure_risk_assessment?._exclusive?.required && ' *'}
                      </Form.Label>
                      <Form.Control
                        isInvalid={this.state.errors['exposure_risk_assessment']}
                        as="select"
                        size="lg"
                        className="form-square"
                        onChange={this.handleChange}
                        value={this.state.current.patient.exposure_risk_assessment || ''}>
                        <option></option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                        <option>No Identified Risk</option>
                      </Form.Control>
                      <Form.Control.Feedback className="d-block" type="invalid">
                        {this.state.errors['exposure_risk_assessment']}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="8" controlId="monitoring_plan">
                      <Form.Label className="nav-input-label">MONITORING PLAN{schema?.fields?.monitoring_plan?._exclusive?.required && ' *'}</Form.Label>
                      <Form.Control
                        isInvalid={this.state.errors['monitoring_plan']}
                        as="select"
                        size="lg"
                        className="form-square"
                        onChange={this.handleChange}
                        value={this.state.current.patient.monitoring_plan || ''}>
                        <option>None</option>
                        <option>Daily active monitoring</option>
                        <option>Self-monitoring with public health supervision</option>
                        <option>Self-monitoring with delegated supervision</option>
                        <option>Self-observation</option>
                      </Form.Control>
                      <Form.Control.Feedback className="d-block" type="invalid">
                        {this.state.errors['monitoring_plan']}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row className="pt-3 align-items-end">
                    <Form.Group as={Col} md="14" controlId="jurisdiction_id">
                      <Form.Label className="nav-input-label">
                        ASSIGNED JURISDICTION{schema?.fields?.jurisdiction_label?._exclusive?.required && ' *'}
                      </Form.Label>
                      <Form.Control
                        isInvalid={this.state.errors['jurisdiction_id']}
                        as="input"
                        name="jurisdictionId"
                        list="jurisdictionPaths"
                        autoComplete="off"
                        size="lg"
                        className="form-square"
                        onChange={this.handleChange}
                        value={this.state.jurisdictionPath}
                      />
                      <datalist id="jurisdictionPaths">
                        {Object.entries(this.props.jurisdictionPaths).map(([id, path]) => {
                          return (
                            <option value={path} key={id}>
                              {path}
                            </option>
                          );
                        })}
                      </datalist>
                      <Form.Control.Feedback className="d-block" type="invalid">
                        {this.state.errors['jurisdiction_id']}
                      </Form.Control.Feedback>
                      {this.props.has_group_members &&
                        this.state.current.patient.jurisdiction_id !== this.state.originalJurisdictionId &&
                        Object.keys(this.props.jurisdictionPaths).includes(this.state.current.patient.jurisdiction_id) && (
                          <Form.Group className="mt-2">
                            <Form.Check
                              type="switch"
                              id="update_group_member_jurisdiction_id"
                              name="jurisdiction_id"
                              label="Apply this change to the entire household that this monitoree is responsible for"
                              onChange={this.handlePropagatedFieldChange}
                              checked={this.state.current.propagatedFields.jurisdiction_id === true || false}
                            />
                          </Form.Group>
                        )}
                    </Form.Group>
                  </Form.Row>
                  <Form.Row className="pt-4 pb-3">
                    <Form.Group as={Col} md="24" controlId="exposure_notes">
                      <Form.Label className="nav-input-label">EXPOSURE NOTES{schema?.fields?.exposure_notes?._exclusive?.required && ' *'}</Form.Label>
                      <Form.Control
                        isInvalid={this.state.errors['exposure_notes']}
                        as="textarea"
                        rows="5"
                        size="lg"
                        className="form-square"
                        placeholder="enter additional information about monitoree’s potential exposure"
                        value={this.state.current.patient.exposure_notes || ''}
                        onChange={this.handleChange}
                      />
                      <Form.Control.Feedback className="d-block" type="invalid">
                        {this.state.errors['exposure_notes']}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Form.Row>
                </Form.Group>
              </Form.Row>
            </Form>
            {this.props.previous && (
              <Button variant="outline-primary" size="lg" className="btn-square px-5" onClick={this.props.previous}>
                Previous
              </Button>
            )}
            {this.props.next && (
              <Button variant="outline-primary" size="lg" className="float-right btn-square px-5" onClick={() => this.validate(this.props.next)}>
                Next
              </Button>
            )}
            {this.props.submit && (
              <Button variant="outline-primary" size="lg" className="float-right btn-square px-5" onClick={this.props.submit}>
                Finish
              </Button>
            )}
          </Card.Body>
        </Card>
      </React.Fragment>
    );
  }
}

const schema = yup.object().shape({
  last_date_of_exposure: yup
    .date('Date must correspond to the "mm/dd/yyyy" format.')
    .max(new Date(), 'Date can not be in the future.')
    .required('Please enter a last date of exposure.')
    .nullable(),
  potential_exposure_location: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  potential_exposure_country: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  contact_of_known_case: yup.boolean().nullable(),
  contact_of_known_case_id: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  healthcare_personnel_facility_name: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  laboratory_personnel_facility_name: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  was_in_health_care_facility_with_known_cases_facility_name: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  member_of_a_common_exposure_cohort_type: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  travel_to_affected_country_or_area: yup.boolean().nullable(),
  was_in_health_care_facility_with_known_cases: yup.boolean().nullable(),
  crew_on_passenger_or_cargo_flight: yup.boolean().nullable(),
  laboratory_personnel: yup.boolean().nullable(),
  healthcare_personnel: yup.boolean().nullable(),
  exposure_risk_assessment: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  monitoring_plan: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  jurisdiction_id: yup
    .number()
    .positive('Please enter a valid jurisdiction.')
    .required(),
  exposure_notes: yup
    .string()
    .max(2000, 'Max length exceeded, please limit to 2000 characters.')
    .nullable(),
});

Exposure.propTypes = {
  currentState: PropTypes.object,
  previous: PropTypes.func,
  setEnrollmentState: PropTypes.func,
  next: PropTypes.func,
  submit: PropTypes.func,
  has_group_members: PropTypes.bool,
  jurisdictionPaths: PropTypes.object,
};

export default Exposure;
