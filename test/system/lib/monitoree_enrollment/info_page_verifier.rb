# frozen_string_literal: true

require 'application_system_test_case'

require_relative 'steps'
require_relative '../system_test_utils'

class MonitoreeEnrollmentInfoPageVerifier < ApplicationSystemTestCase
  @@monitoree_enrollment_steps = MonitoreeEnrollmentSteps.new(nil)
  @@system_test_utils = SystemTestUtils.new(nil)

  def verify_monitoree_info(monitoree, isEpi=false)
    find('#patient-info-header').click if isEpi
    @@monitoree_enrollment_steps.steps.each do |enrollment_step, enrollment_fields|
      verify_enrollment_step(monitoree[enrollment_step.to_s], enrollment_fields)
    end
  end

  def verify_group_member_info(existing_monitoree, new_monitoree, isEpi=false)
    find('#patient-info-header').click if isEpi
    verify_enrollment_step(new_monitoree['identification'], @@monitoree_enrollment_steps.steps[:identification])
    verify_enrollment_step(existing_monitoree['address'], @@monitoree_enrollment_steps.steps[:address])
    verify_enrollment_step(existing_monitoree['contact_info'], @@monitoree_enrollment_steps.steps[:contact_info])
    verify_enrollment_step(existing_monitoree['arrival_info'], @@monitoree_enrollment_steps.steps[:arrival_info])
    verify_enrollment_step(existing_monitoree['additional_planned_travel'], @@monitoree_enrollment_steps.steps[:additional_planned_travel])
    verify_enrollment_step(existing_monitoree['potential_exposure_info'], @@monitoree_enrollment_steps.steps[:potential_exposure_info])
  end

  def verify_enrollment_step(data, fields)
    if data
      fields.each { |field|
        if data[field[:id]] && field[:info_page]
          if field[:type] == 'text' || field[:type] == 'select'
            assert page.has_content?(data[field[:id]]), @@system_test_utils.get_err_msg('Monitoree details', field[:id], data[field[:id]])
          elsif field[:type] == 'date'
            date = @@system_test_utils.format_date(data[field[:id]])
            assert page.has_content?(date), @@system_test_utils.get_err_msg('Monitoree details', field[:id], date)
          elsif field[:type] == 'age'
            age = @@system_test_utils.calculate_age(data[field[:id]])
            assert page.has_content?(age), @@system_test_utils.get_err_msg('Monitoree details', field[:id], age)           
          elsif field[:type] == 'race'
            assert page.has_content?(field[:info_page]), @@system_test_utils.get_err_msg('Monitoree details', field[:info_page], 'present')
          elsif field[:type] == 'checkbox' || field[:type] == 'risk factor'
            assert page.has_content?(field[:label]), @@system_test_utils.get_err_msg('Monitoree details', field[:label], 'present')
          end
        end
      }
    end
  end
end
