# frozen_string_literal: true

# Transfer: transfer model
class Transfer < ApplicationRecord
  belongs_to :to_jurisdiction, class_name: 'Jurisdiction'
  belongs_to :from_jurisdiction, class_name: 'Jurisdiction'
  belongs_to :who, class_name: 'User'
  belongs_to :patient

  def from_path
    from_jurisdiction&.jurisdiction_path_string
  end

  def to_path
    to_jurisdiction&.jurisdiction_path_string
  end
  
  # All incoming transfers with the given jurisdiction id
  scope :with_incoming_jurisdiction_id, lambda { |jurisdiction_id|
    where('to_jurisdiction_id = ?', jurisdiction_id)
  }

  # All outgoing transfers with the given jurisdiction id
  scope :with_outgoing_jurisdiction_id, lambda { |jurisdiction_id|
    where('from_jurisdiction_id = ?', jurisdiction_id)
  }

  # All transfers within the given time frame
  scope :in_time_frame, lambda { |time_frame|
    where('transfers.created_at >= ?', 24.hours.ago) if time_frame == 'Last 24 Hours'
    where('transfers.created_at >= ? AND transfers.created_at < ?', 14.days.ago.to_date, Date.today) if time_frame == 'Last 14 Days'
  }
end
