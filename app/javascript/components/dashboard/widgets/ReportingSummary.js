import React from 'react';
import { Col, Card, Row } from 'react-bootstrap';
import { PieChart, Pie, ResponsiveContainer, Cell, Label, Tooltip } from 'recharts';
import { PropTypes } from 'prop-types';

class ReportingSummary extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const COLORS = ['#0088FE', '#00C49F'];
    const data = [...this.props.stats.reporting_summmary];
    const perc = Math.round((this.props.stats.reporting_summmary[0]['value'] / this.props.stats.system_subjects) * 100 * 10) / 10;
    return (
      <React.Fragment>
        <Card className="card-square">
          <Card.Header as="h5">Today&apos;s Reporting Summary</Card.Header>
          <Card.Body>
            <Row className="mx-4 mt-3">
              <Col md="12">
                <Row>
                  <h5>REPORTED TODAY</h5>
                </Row>
                <Row>
                  <h1 className="display-1" style={{ color: '#0088FE' }}>
                    {data[0]['value']}
                  </h1>
                </Row>
                <Row>
                  <h5>NOT YET REPORTED</h5>
                </Row>
                <Row>
                  <h1 className="display-1" style={{ color: '#00C49F' }}>
                    {data[1]['value']}
                  </h1>
                </Row>
              </Col>
              <Col md="12">
                <div style={{ width: '100%', height: '100%' }} className="recharts-wrapper">
                  <ResponsiveContainer>
                    <PieChart onMouseEnter={this.onPieEnter}>
                      <Pie data={data} innerRadius={90} outerRadius={120} fill="#8884d8" paddingAngle={2} dataKey="value">
                        <Label className="display-5" value={perc + '%'} position="center" />
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </React.Fragment>
    );
  }
}

ReportingSummary.propTypes = {
  stats: PropTypes.object,
};

export default ReportingSummary;
