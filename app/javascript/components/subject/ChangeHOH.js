import React from 'react';
import { Form, Row, Col, Button, Modal } from 'react-bootstrap';
import { PropTypes } from 'prop-types';
import axios from 'axios';

class ChangeHOH extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  toggleModal() {
    let current = this.state.showModal;
    this.setState({
      showModal: !current,
    });
  }

  handleChange(event) {
    this.setState({ [event.target.id]: event.target.value });
  }

  submit() {
    axios.defaults.headers.common['X-CSRF-Token'] = this.props.authenticity_token;
    axios
      .post(window.BASE_PATH + '/patients/' + this.props.patient.id + '/update_hoh', {
        new_hoh_id: this.state.hoh_selection,
        household_ids: this.props?.groupMembers?.map(member => {
          return member.id;
        }),
      })
      .then(() => {
        location.href = window.BASE_PATH + '/patients/' + this.props.patient.id;
      })
      .catch(error => {
        console.error(error);
      });
  }

  createModal(title, toggle, submit) {
    return (
      <Modal size="lg" show centered>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Form.Group as={Col}>
                <Form.Label className="nav-input-label">Select The New Head Of Household</Form.Label>
                <Form.Label size="sm" className="nav-input-label">
                  Note: The selected monitoree will become the responder for the current monitoree and all others within the list
                </Form.Label>
                <Form.Control as="select" className="form-control-lg" id="hoh_selection" onChange={this.handleChange} value={undefined}>
                  <option value={undefined}>--</option>
                  {this.props?.groupMembers?.map((member, index) => {
                    return (
                      <option key={`option-${index}`} value={member.id}>
                        {member.last_name}, {member.first_name} {member.middle_name || ''}
                      </option>
                    );
                  })}
                </Form.Control>
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary btn-square" onClick={submit}>
            Update
          </Button>
          <Button variant="secondary btn-square" onClick={toggle}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    return (
      <React.Fragment>
        <Button size="sm" className="my-2" onClick={this.toggleModal}>
          <i className="fas fa-house-user"></i> Change Head of Household
        </Button>
        {this.state.showModal && this.createModal('Edit Head of Household', this.toggleModal, this.submit)}
      </React.Fragment>
    );
  }
}

ChangeHOH.propTypes = {
  patient: PropTypes.object,
  groupMembers: PropTypes.array,
  authenticity_token: PropTypes.string,
};

export default ChangeHOH;
