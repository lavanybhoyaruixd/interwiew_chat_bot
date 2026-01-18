import React from 'react';
import { Card, ListGroup, Badge, ProgressBar } from 'react-bootstrap';

const ResumeAnalysis = ({ analysis }) => {
  if (!analysis) return null;

  const { basicInfo, aiAnalysis } = analysis;

  const renderSkills = (skills, type = 'primary') => {
    if (!skills || skills.length === 0) return <p>No skills found.</p>;
    
    return (
      <div className="skills-container">
        {skills.map((skill, index) => (
          <Badge key={index} bg={type} className="me-2 mb-2">
            {skill}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="resume-analysis">
      <Card className="mb-4">
        <Card.Header as="h5">Basic Information</Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            {basicInfo?.name && (
              <ListGroup.Item>
                <strong>Name:</strong> {basicInfo.name}
              </ListGroup.Item>
            )}
            {basicInfo?.email && (
              <ListGroup.Item>
                <strong>Email:</strong> {basicInfo.email}
              </ListGroup.Item>
            )}
            {basicInfo?.phone && (
              <ListGroup.Item>
                <strong>Phone:</strong> {basicInfo.phone}
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card.Body>
      </Card>

      {aiAnalysis && (
        <>
          <Card className="mb-4">
            <Card.Header as="h5">Professional Summary</Card.Header>
            <Card.Body>
              <p>{aiAnalysis.summary || 'No summary available.'}</p>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header as="h5">Experience Level</Card.Header>
            <Card.Body>
              <h4>
                <Badge bg="info">
                  {aiAnalysis.experience_level || 'Not specified'}
                </Badge>
              </h4>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header as="h5">Skills</Card.Header>
            <Card.Body>
              <h6>Technical Skills</h6>
              {renderSkills(aiAnalysis.skills?.technical, 'primary')}
              
              <h6 className="mt-3">Soft Skills</h6>
              {renderSkills(aiAnalysis.skills?.soft, 'success')}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header as="h5">Strengths</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {aiAnalysis.strengths?.map((strength, index) => (
                  <ListGroup.Item key={index}>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    {strength}
                  </ListGroup.Item>
                )) || <p>No strengths identified.</p>}
              </ListGroup>
            </Card.Body>
          </Card>

          {aiAnalysis.improvement_areas?.length > 0 && (
            <Card className="mb-4">
              <Card.Header as="h5">Areas for Improvement</Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {aiAnalysis.improvement_areas.map((area, index) => (
                    <ListGroup.Item key={index}>
                      <i className="fas fa-lightbulb text-warning me-2"></i>
                      {area}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          <Card className="mb-4">
            <Card.Header as="h5">Suggested Roles</Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                {aiAnalysis.suggested_roles?.map((role, index) => (
                  <Badge key={index} bg="info" className="fs-6 p-2">
                    {role}
                  </Badge>
                )) || <p>No suggested roles available.</p>}
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      <style jsx>{`
        .resume-analysis {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .skill-badge {
          font-size: 0.9rem;
          padding: 0.5rem 0.75rem;
          margin: 0.25rem;
        }
        
        .section-title {
          color: #495057;
          border-bottom: 2px solid #dee2e6;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ResumeAnalysis;
