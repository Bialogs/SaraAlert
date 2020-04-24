# frozen_string_literal: true

require 'application_system_test_case'

require_relative '../system_test_utils'

class AnalyticsMonitoreeCountsVerifier < ApplicationSystemTestCase
  @@system_test_utils = SystemTestUtils.new(nil)

  RISK_LEVELS = ['high', 'medium', 'low', 'no_identified', 'missing']
  
  def verify_monitoree_counts(analytic_id)
    verify_monitoree_counts_by_monitoring_status(analytic_id, true)
    verify_monitoree_counts_by_age_group(analytic_id, true)
    verify_monitoree_counts_by_sex(analytic_id, true)
    verify_monitoree_counts_by_risk_factor(analytic_id, true)
    verify_monitoree_counts_by_exposure_country(analytic_id, true)
  end

  def verify_monitoree_counts_by_monitoring_status(analytic_id, active_monitoring)
    element = find('h5', text: 'Monitoring Status by Risk Level Amongst Those Currently Under Active Monitoring').first(:xpath, './/..//div/table/tbody')
    verify_monitoree_counts_for_category_type(element, analytic_id, active_monitoring, 'Monitoring Status')
  end

  def verify_monitoree_counts_by_age_group(analytic_id, active_monitoring)
    element = find('h4', text: 'Age (Years)').first(:xpath, './/..//table/tbody')
    verify_monitoree_counts_for_category_type(element, analytic_id, active_monitoring, 'Age Group')
  end

  def verify_monitoree_counts_by_sex(analytic_id, active_monitoring)
    element = find('h4', text: 'Sex').first(:xpath, './/..//table/tbody')
    verify_monitoree_counts_for_category_type(element, analytic_id, active_monitoring, 'Sex')
  end

  def verify_monitoree_counts_by_risk_factor(analytic_id, active_monitoring)
    element = find('h4', text: 'Exposure Risk Factors').first(:xpath, './/..//table/tbody')
    verify_monitoree_counts_for_category_type(element, analytic_id, active_monitoring, 'Risk Factor')
  end

  def verify_monitoree_counts_by_exposure_country(analytic_id, active_monitoring)
    element = find('div', class: 'h4', text: 'Country of Exposure').first(:xpath, './/..//..//table/tbody')
    verify_monitoree_counts_for_category_type(element, analytic_id, active_monitoring, 'Exposure Country')
  end

  def verify_monitoree_counts_for_category_type(element, analytic_id, active_monitoring, category_type)
    element.text.split('\n').each { |distribution_text|
      distribution = get_distributions(distribution_text)
      # verify_counts(distribution, analytic_id, active_monitoring, category_type, distribution.fetch(:category))
      validate_counts(distribution)
      validate_percentages(distribution)
    }
  end

  def verify_counts(distribution, analytic_id, active_monitoring, category_type, category)
    RISK_LEVELS.each { |risk_level|
      count = distribution.fetch("#{risk_level}_count".to_sym)
      expected_count = get_expected_count(analytic_id, active_monitoring, category_type, category, risk_level)
      if !expected_count.nil?
        assert_equal(expected_count['total'], count, @@system_test_utils.get_err_msg('Monitoree count', "#{category_type} #{category} #{risk_level}", expected_count['total']))
      end
    }
  end

  def validate_counts(distribution)
    sum_of_counts = 0
    RISK_LEVELS.each { |risk_level|
      sum_of_counts += distribution.fetch("#{risk_level}_count".to_sym)
    }
    assert_equal(sum_of_counts, distribution.fetch(:total_count), @@system_test_utils.get_err_msg('Monitoree count', 'sum of counts', sum_of_counts))
  end

  def validate_percentages(distribution)
    if distribution.has_key?(:total_percentage)
      RISK_LEVELS.each { |risk_level|
        percentage = distribution.fetch("#{risk_level}_percentage".to_sym)
        assert_operator percentage, :>=, 0, err_msg_for_distribution_percentage(distribution, risk_level)
        assert_operator percentage, :<=, 100, err_msg_for_distribution_percentage(distribution, risk_level)
      }
    end
  end

  def get_distributions(text)
    elements = text.split(' ')
    if ['Symptomatic', 'Non-Reporting', 'Asymptomatic'].include? elements[0]
      get_distributions_with_percentages(elements)
    else
      get_distributions_without_percentages(elements)
    end
  end

  def get_distributions_with_percentages(elements)
    {
      category: elements[0],
      high_count: elements[1].to_i,
      high_percentage: elements[2].tr('(%)', '').to_f,
      medium_count: elements[3].to_i,
      medium_percentage: elements[4].tr('(%)', '').to_f,
      low_count: elements[5].to_i,
      low_percentage: elements[6].tr('(%)', '').to_f,
      no_identified_count: elements[7].to_i,
      no_identified_percentage: elements[8].tr('(%)', '').to_f,
      missing_count: elements[9].to_i,
      missing_percentage: elements[10].tr('(%)', '').to_f,
      total_count: elements[11].to_i,
      total_percentage: elements[12].tr('(%)', '').to_f
    }
  end

  def get_distributions_without_percentages(elements)
    {
      category: elements[0],
      high_count: elements[1].to_i,
      medium_count: elements[2].to_i,
      low_count: elements[3].to_i,
      no_identified_count: elements[4].to_i,
      missing_count: elements[5].to_i,
      total_count: elements[6].to_i,
    }
  end

  def get_expected_count(analytic_id, active_monitoring, category_type, category, risk_level)
    MonitoreeCount.where(analytic_id: analytic_id, 
                         active_monitoring: active_monitoring, 
                         category_type: category_type, 
                         category: category, 
                         risk_level: risk_level_label(risk_level)).first
  end

  def err_msg_for_distribution_percentage(distribution, risk_level)
    @@system_test_utils.get_err_msg('Monitoree counts', "#{distribution.fetch('category'.to_sym)} #{risk_level} risk level percentage", 'less than or equal to 100')
  end

  def risk_level_label(risk_level)
    mapping = {
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low',
      'no_identified': 'No Identified Risk',
      'missing': 'Missing'
    }
    mapping.fetch(risk_level.to_sym)
  end
end