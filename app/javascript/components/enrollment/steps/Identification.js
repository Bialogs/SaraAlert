import React from 'react';
import { Card, Button, Form, Col } from 'react-bootstrap';
import moment from 'moment';
import { PropTypes } from 'prop-types';
import * as yup from 'yup';

class Identification extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...this.props, current: { ...this.props.currentState }, errors: {}, modified: {} };
    this.handleChange = this.handleChange.bind(this);
    this.validate = this.validate.bind(this);
  }

  handleChange(event) {
    let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    let current = this.state.current;
    let modified = this.state.modified;
    let self = this;
    event.persist();
    value = event.target.type === 'date' && value === '' ? undefined : value;
    this.setState(
      {
        current: { ...current, patient: { ...current.patient, [event.target.id]: value } },
        modified: { ...modified, patient: { ...modified.patient, [event.target.id]: value } },
      },
      () => {
        let current = this.state.current;
        let modified = this.state.modified;
        if (event.target.id === 'date_of_birth') {
          let age;
          // if value is undefined, age will stay undefined (which nulls out the age field)
          if (typeof value !== 'undefined') {
            age = 0 - moment(self.state.current.patient.date_of_birth).diff(moment.now(), 'years');
            age = age < 200 && age > 0 ? age : current.patient.age;
          }
          self.setState(
            {
              current: { ...current, patient: { ...current.patient, age } },
              modified: { ...modified, patient: { ...modified.patient, age } },
            },
            () => {
              self.props.setEnrollmentState({ ...self.state.modified });
            }
          );
        } else {
          self.props.setEnrollmentState({ ...self.state.modified });
        }
      }
    );
  }

  validate(callback) {
    let self = this;
    schema
      .validate(this.state.current.patient, { abortEarly: false })
      .then(function() {
        // No validation issues? Invoke callback (move to next step)
        self.setState({ errors: {} }, () => {
          callback();
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
          <Card.Header as="h5">Monitoree Identification</Card.Header>
          <Card.Body>
            <Form>
              <Form.Row className="pt-2">
                <Form.Group as={Col} controlId="first_name">
                  <Form.Label className="nav-input-label">FIRST NAME{schema?.fields?.first_name?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['first_name']}
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.first_name || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['first_name']}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} controlId="middle_name">
                  <Form.Label className="nav-input-label">MIDDLE NAME(S){schema?.fields?.middle_name?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['middle_name']}
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.middle_name || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['middle_name']}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} controlId="last_name">
                  <Form.Label className="nav-input-label">LAST NAME{schema?.fields?.last_name?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['last_name']}
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.last_name || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['last_name']}
                  </Form.Control.Feedback>
                </Form.Group>
              </Form.Row>
              <Form.Row className="pt-2">
                <Form.Group as={Col} md="auto" controlId="date_of_birth">
                  <Form.Label className="nav-input-label">DATE OF BIRTH{schema?.fields?.date_of_birth?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['date_of_birth']}
                    size="lg"
                    type="date"
                    className="form-square"
                    value={this.state.current.patient.date_of_birth || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['date_of_birth']}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="1"></Form.Group>
                <Form.Group as={Col} controlId="age" md="auto">
                  <Form.Label className="nav-input-label">AGE{schema?.fields?.age?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['age']}
                    placeholder=""
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.age || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['age']}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="1"></Form.Group>
                <Form.Group as={Col} controlId="sex" md="auto">
                  <Form.Label className="nav-input-label">SEX AT BIRTH{schema?.fields?.sex?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['sex']}
                    as="select"
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.sex || ''}
                    onChange={this.handleChange}>
                    <option></option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Unknown</option>
                  </Form.Control>
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['sex']}
                  </Form.Control.Feedback>
                </Form.Group>
              </Form.Row>
              <Form.Row className="pt-1">
                <Form.Group as={Col} md="auto">
                  <Form.Label className="nav-input-label">RACE (SELECT ALL THAT APPLY)</Form.Label>
                  <Form.Check
                    type="switch"
                    id="white"
                    label="WHITE"
                    checked={this.state.current.patient.white === true || false}
                    onChange={this.handleChange}
                  />
                  <Form.Check
                    className="pt-2"
                    type="switch"
                    id="black_or_african_american"
                    label="BLACK OR AFRICAN AMERICAN"
                    checked={this.state.current.patient.black_or_african_american === true || false}
                    onChange={this.handleChange}
                  />
                  <Form.Check
                    className="pt-2"
                    type="switch"
                    id="american_indian_or_alaska_native"
                    label="AMERICAN INDIAN OR ALASKA NATIVE"
                    checked={this.state.current.patient.american_indian_or_alaska_native === true || false}
                    onChange={this.handleChange}
                  />
                  <Form.Check
                    className="pt-2"
                    type="switch"
                    id="asian"
                    label="ASIAN"
                    checked={this.state.current.patient.asian === true || false}
                    onChange={this.handleChange}
                  />
                  <Form.Check
                    className="pt-2"
                    type="switch"
                    id="native_hawaiian_or_other_pacific_islander"
                    label="NATIVE HAWAIIAN OR OTHER PACIFIC ISLANDER"
                    checked={this.state.current.patient.native_hawaiian_or_other_pacific_islander === true || false}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Form.Group as={Col} md="1"></Form.Group>
                <Form.Group as={Col} md="8" controlId="ethnicity">
                  <Form.Label className="nav-input-label">ETHNICITY{schema?.fields?.ethnicity?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control as="select" size="lg" className="form-square" value={this.state.current.patient.ethnicity || ''} onChange={this.handleChange}>
                    <option></option>
                    <option>Not Hispanic or Latino</option>
                    <option>Hispanic or Latino</option>
                  </Form.Control>
                </Form.Group>
              </Form.Row>
              <Form.Row className="pt-2">
                <Form.Group as={Col} controlId="primary_language">
                  <Form.Label className="nav-input-label">PRIMARY LANGUAGE{schema?.fields?.primary_language?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['primary_language']}
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.primary_language || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['primary_language']}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="1"></Form.Group>
                <Form.Group as={Col} controlId="secondary_language">
                  <Form.Label className="nav-input-label">SECONDARY LANGUAGE{schema?.fields?.secondary_language?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['secondary_language']}
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.secondary_language || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['secondary_language']}
                  </Form.Control.Feedback>
                </Form.Group>
              </Form.Row>
              <Form.Row className="pt-1">
                <Form.Group as={Col}>
                  <Form.Check
                    type="switch"
                    id="interpretation_required"
                    label="INTERPRETATION REQUIRED"
                    checked={this.state.current.patient.interpretation_required || false}
                    onChange={this.handleChange}
                  />
                </Form.Group>
              </Form.Row>
              <Form.Row className="pt-2">
                <Form.Group as={Col} md={12} controlId="nationality">
                  <Form.Label className="nav-input-label">NATIONALITY{schema?.fields?.nationality?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['nationality']}
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.nationality || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['nationality']}
                  </Form.Control.Feedback>
                </Form.Group>
              </Form.Row>
              <Form.Row className="pt-2">
                <Form.Group as={Col} md={8} controlId="user_defined_id_statelocal">
                  <Form.Label className="nav-input-label">STATE/LOCAL ID{schema?.fields?.user_defined_id_statelocal?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['user_defined_id_statelocal']}
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.user_defined_id_statelocal || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['user_defined_id_statelocal']}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md={8} controlId="user_defined_id_cdc">
                  <Form.Label className="nav-input-label">CDC ID{schema?.fields?.user_defined_id_cdc?._exclusive?.required && ' *'}</Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['user_defined_id_cdc']}
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.user_defined_id_cdc || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['user_defined_id_cdc']}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md={8} controlId="user_defined_id_nndss">
                  <Form.Label className="nav-input-label">
                    NNDSS LOC. REC. ID/CASE ID{schema?.fields?.user_defined_id_nndss?._exclusive?.required && ' *'}
                  </Form.Label>
                  <Form.Control
                    isInvalid={this.state.errors['user_defined_id_nndss']}
                    size="lg"
                    className="form-square"
                    value={this.state.current.patient.user_defined_id_nndss || ''}
                    onChange={this.handleChange}
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {this.state.errors['user_defined_id_nndss']}
                  </Form.Control.Feedback>
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
  first_name: yup
    .string()
    .required('Please enter a First Name.')
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  middle_name: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  last_name: yup
    .string()
    .required('Please enter a Last Name.')
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  date_of_birth: yup
    .date('Date must correspond to the "mm/dd/yyyy" format.')
    .required('Please enter a date of birth.')
    .max(new Date(), 'Date can not be in the future.')
    .nullable(),
  age: yup.number().nullable(),
  sex: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  white: yup.boolean().nullable(),
  black_or_african_american: yup.boolean().nullable(),
  american_indian_or_alaska_native: yup.boolean().nullable(),
  asian: yup.boolean().nullable(),
  native_hawaiian_or_other_pacific_islander: yup.boolean().nullable(),
  ethnicity: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  primary_language: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  secondary_language: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  interpretation_required: yup.boolean().nullable(),
  nationality: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
  user_defined_id: yup
    .string()
    .max(200, 'Max length exceeded, please limit to 200 characters.')
    .nullable(),
});

Identification.propTypes = {
  currentState: PropTypes.object,
  previous: PropTypes.func,
  next: PropTypes.func,
  submit: PropTypes.func,
};

export default Identification;
