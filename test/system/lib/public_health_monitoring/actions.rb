# frozen_string_literal: true

require 'application_system_test_case'

require_relative 'history_verifier'
require_relative '../system_test_utils'

class PublicHealthMonitoringActions < ApplicationSystemTestCase
  @@public_health_monitoring_history_verifier = PublicHealthMonitoringHistoryVerifier.new(nil)
  @@system_test_utils = SystemTestUtils.new(nil)

  def update_monitoring_status(user_label, monitoring_status, status_change_reason, reasoning)
    if monitoring_status != find('#monitoring_status')['value']
      select monitoring_status, from: 'monitoring_status'
      select status_change_reason, from: 'monitoring_status_option'
      fill_in 'reasoning', with: reasoning
      click_on 'Submit'
      @@system_test_utils.wait_for_modal_animation
      @@public_health_monitoring_history_verifier.verify_monitoring_status(user_label, monitoring_status, status_change_reason, reasoning)
    end
  end

  def update_exposure_risk_assessment(user_label, exposure_risk_assessment, reasoning)
    if exposure_risk_assessment != find('#exposure_risk_assessment')['value']
      select exposure_risk_assessment, from: 'exposure_risk_assessment'
      fill_in 'reasoning', with: reasoning
      click_on 'Submit'
      @@system_test_utils.wait_for_modal_animation
      @@public_health_monitoring_history_verifier.verify_exposure_risk_assessment(user_label, exposure_risk_assessment, reasoning)
    end
  end

  def update_monitoring_plan(user_label, monitoring_plan, reasoning)
    if monitoring_plan != find('#monitoring_plan')['value']
      select monitoring_plan, from: 'monitoring_plan'
      fill_in 'reasoning', with: reasoning
      click_on 'Submit'
      @@system_test_utils.wait_for_modal_animation
      @@public_health_monitoring_history_verifier.verify_monitoring_plan(user_label, monitoring_plan, reasoning)
    end
  end

  def update_latest_public_health_action(user_label, latest_public_health_action, reasoning)
    if latest_public_health_action != find('#public_health_action')['value']
      select latest_public_health_action, from: 'public_health_action'
      fill_in 'reasoning', with: reasoning
      click_on 'Submit'
      @@system_test_utils.wait_for_modal_animation
      @@public_health_monitoring_history_verifier.verify_latest_public_health_action(user_label, latest_public_health_action, reasoning)
    end
  end

  def update_assigned_jurisdiction(user_label, jurisdiction, reasoning, valid_jurisdiction=true, under_hierarchy=true)
    assert page.has_button?('Change Jurisdiction', disabled: true)
    fill_in 'jurisdictionList', with: jurisdiction
    if valid_jurisdiction
      assert page.has_button?('Change Jurisdiction', disabled: false)
      click_on 'Change Jurisdiction'
      fill_in 'reasoning', with: reasoning
      click_on 'Submit'
      @@system_test_utils.wait_for_modal_animation
      if under_hierarchy
        assert page.has_button?('Change Jurisdiction', disabled: true)
        @@public_health_monitoring_history_verifier.verify_assigned_jurisdiction(user_label, jurisdiction, reasoning)
      end
    else
      assert page.has_button?('Change Jurisdiction', disabled: true)
    end
  end
end
