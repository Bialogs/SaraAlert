# frozen_string_literal: true

require 'application_system_test_case'

require_relative '../system_test_utils'

class PublicHealthMonitoringReportsVerifier < ApplicationSystemTestCase
  @@system_test_utils = SystemTestUtils.new(nil)

  def verify_existing_reports(patient)
    assessments = Assessment.where(patient_id: patient.id)
    assessments.each { |assessment|
      assert page.has_content?(assessment.who_reported), @@system_test_utils.get_err_msg('Reports', 'who reported', assessment.who_reported)
      verify_symptoms(Condition.where(assessment_id: assessment.id).joins(:symptoms))
    }
  end

  def verify_new_report(assessment)
    assert page.has_content?('Monitoree'), @@system_test_utils.get_err_msg('Reports', 'Reporter', 'Monitoree')
    verify_symptoms(assessment['symptoms'])
  end

  def verify_add_report(user_name, assessment)
    assert page.has_content?(user_name), @@system_test_utils.get_err_msg('Reports', 'Reporter', user_name)
    verify_symptoms(assessment['symptoms'])
  end

  def verify_edit_report(user_name, assessment_id, assessment)
    assert page.has_content?(user_name), @@system_test_utils.get_err_msg('Reports', 'Reporter', user_name)
    verify_symptoms(assessment['symptoms'])
  end

  def verify_symptoms(symptoms)
    symptoms.each { |symptom|
      case symptom['type']
      when 'BoolSymptom'
        assert page.has_content?(symptom['bool_value'] ? 'Yes' : 'No'), @@system_test_utils.get_err_msg('Report', 'boolean symptom', symptom['bool_value'])
      when 'FloatSymptom'
        assert page.has_content?(symptom['float_value']), @@system_test_utils.get_err_msg('Report', 'float symptom', symptom['float_value'])
      when 'IntSymptom'
        assert page.has_content?(symptom['int_value']), @@system_test_utils.get_err_msg('Report', 'int symptom', symptom['int_value'])
      end
    }
  end

  def verify_workflow(workflow)
    assert page.has_content?(workflow), @@system_test_utils.get_err_msg('Reports', 'workflow', workflow)
  end

  def verify_current_status(current_status)
    assert page.has_content?(current_status), @@system_test_utils.get_err_msg('Reports', 'current monitoring status', current_status)
  end

  def verify_pause_notifications(pause_notifications)
    assert page.has_content?("#{pause_notifications ? 'Resume' : 'Pause'} Notifications"), @@system_test_utils.get_err_msg('Reports', 'notifications paused', pause_notifications)
  end
end
