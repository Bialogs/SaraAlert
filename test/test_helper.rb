# frozen_string_literal: true

ENV['RAILS_ENV'] ||= 'test'
require_relative '../lib/simplecov_saraalert'
SimpleCov.start('saraalert')
require_relative '../config/environment'
require 'rails/test_help'
