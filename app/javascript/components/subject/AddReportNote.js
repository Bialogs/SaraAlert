import React from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { PropTypes } from 'prop-types';
import axios from 'axios';
import reportError from '../util/ReportError';

class AddReportingNote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAddReportingNoteModal: false,
      comment: '',
    };
    this.toggleAddReportingNoteModal = this.toggleAddReportingNoteModal.bind(this);
    this.addReportingNote = this.addReportingNote.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  toggleAddReportingNoteModal() {
    let current = this.state.showAddReportingNoteModal;
    this.setState({
      showAddReportingNoteModal: !current,
    });
  }

  handleChange(event) {
    this.setState({ [event.target.id]: event.target.value });
  }

  addReportingNote() {
    axios.defaults.headers.common['X-CSRF-Token'] = this.props.authenticity_token;
    axios
      .post(window.BASE_PATH + '/histories', {
        patient_id: this.props.patient.id,
        comment: 'User left a note for a report (ID: ' + this.props.assessment.id + '). Note is: ' + this.state.comment,
        type: 'Report Note',
      })
      .then(() => {
        location.href = window.BASE_PATH + '/patients/' + this.props.patient.id;
      })
      .catch(error => {
        reportError(error);
      });
  }

  createModal(title, toggle, submit, id) {
    return (
      <Modal size="lg" show centered>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please enter your note about the assessment (ID: {id}) below.</p>
          <Form.Group>
            <Form.Control as="textarea" rows="2" id="comment" onChange={this.handleChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary btn-square" onClick={submit}>
            Submit
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
        <Button variant="link" onClick={this.toggleAddReportingNoteModal} className="btn-sm py-0">
          <i className="fas fa-comment-medical"></i> Add Note
        </Button>
        {this.state.showAddReportingNoteModal &&
          this.createModal('Add Note To Report', this.toggleAddReportingNoteModal, this.addReportingNote, this.props.assessment.id)}
      </React.Fragment>
    );
  }
}

AddReportingNote.propTypes = {
  authenticity_token: PropTypes.string,
  assessment: PropTypes.object,
  patient: PropTypes.object,
};

export default AddReportingNote;
