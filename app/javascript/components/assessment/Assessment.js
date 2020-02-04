import React from "react"
import PropTypes from "prop-types"
import axios from "axios"
import { Carousel } from 'react-bootstrap';
import ReporterIdentification from './steps/ReporterIdentification';
import GeneralAssessment from './steps/GeneralAssessment';
import SymptomsAssessment from './steps/SymptomsAssessment';
import AssessmentCompleted from './steps/AssessmentCompleted';


class Assessment extends React.Component {

  constructor(props) {
    super(props);
    this.state = { index: 0, direction: null, patient_submission_token: props.patient_submission_token };
    this.setAssessmentState = this.setAssessmentState.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goto = this.goto.bind(this);
    this.submit = this.submit.bind(this);
  }

  setAssessmentState(assessmentState) {
    let currentAssessmentState = this.state.assessmentState;
    this.setState( { assessmentState: { ...currentAssessmentState, ...assessmentState } } );  }

  next() {
    let index = this.state.index;
    let lastIndex = this.state.lastIndex;
    if (lastIndex) {
      this.setState({direction: "next"}, () => {
        this.setState({index: lastIndex + 1, lastIndex: null});
      });
    } else {
      this.setState({direction: "next"}, () => {
        this.setState({index: index + 1, lastIndex: null});
      });
    }
  }

  previous() {
    let index = this.state.index;
    this.setState({direction: "prev"}, () => {
      this.setState({index: index - 1, lastIndex: null});
    });
  }

  goto(targetIndex) {
    let index = this.state.index;
    if (targetIndex > index) {
      this.setState({direction: "next"}, () => {
        this.setState({index: targetIndex, lastIndex: index});
      });
    } else if (targetIndex < index) {
      this.setState({direction: "prev"}, () => {
        this.setState({index: targetIndex, lastIndex: index});
      });
    }
  }

  submit() {
    var data = new FormData();
    var assessmentState = this.state.assessmentState;
    for (var key in assessmentState) {
        if (assessmentState.hasOwnProperty(key) && typeof(assessmentState[key] !== 'function')) {
            data.append(key, assessmentState[key]);
        }
    }

    data.append('patient_submission_token',this.state.patient_submission_token)
    axios.defaults.headers.common['X-CSRF-Token'] = this.props.authenticity_token
    axios({
        method: 'post',
        url: `/patients/${this.state.patient_submission_token}/assessments`,
        data: data,
        headers: {'Content-Type': 'multipart/form-data' }
        })
        .then(function (response) {
            //handle success
            console.log(response);
        })
        .catch(function (response) {
            //handle error
            console.log(response);
        });
    this.goto(2)
  }

  render () {
    let {index, ...strippedState} = this.state; // "strippedState" is "this.state" without "index"
    return (
      <React.Fragment>
        <Carousel controls={false} indicators={false} interval={null} keyboard={false} activeIndex={this.state.index} direction={this.state.direction} onSelect={() => {}}>
          <Carousel.Item>
            <GeneralAssessment goto={this.goto} submit={this.submit} setAssessmentState={this.setAssessmentState} currentState={this.state.assessmentState} />
          </Carousel.Item>
          <Carousel.Item>
            <SymptomsAssessment goto={this.goto} submit={this.submit} setAssessmentState={this.setAssessmentState} currentState={this.state.assessmentState}/>
          </Carousel.Item>
          <Carousel.Item>
            <AssessmentCompleted goto={this.goto} submit={this.submit} setAssessmentState={this.setAssessmentState} currentState={this.state.assessmentState} />
          </Carousel.Item>
        </Carousel>
      </React.Fragment>
    );
  }
}

Assessment.propTypes = {
  patient: PropTypes.object
};

export default Assessment