# frozen_string_literal: true

require 'application_system_test_case'

require_relative '../system_test_utils'

class AnalyticsMonitoreeSnapshotsVerifier < ApplicationSystemTestCase
  @@system_test_utils = SystemTestUtils.new(nil)

  MONITOREE_SNAPSHOT_FIELDS = ['new_enrollments', 'transferred_in', 'closed', 'transferred_out']

  def verify_monitoree_snapshots(analytic_id)
    monitoree_snapshots = MonitoreeSnapshot.where(analytic_id: analytic_id)
    monitoree_snapshots.each { |monitoree_snapshot|
      MONITOREE_SNAPSHOT_FIELDS.each { |field|
        err_msg = @@system_test_utils.get_err_msg('Monitoree snapshots', "#{field} for #{monitoree_snapshot.time_frame}", monitoree_snapshot[field])
        assert page.has_content?(monitoree_snapshot[field]), err_msg
      }
    }
  end
end
