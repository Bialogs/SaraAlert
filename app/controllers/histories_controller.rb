# frozen_string_literal: true

# HistoriesController: for keeping track of user actions over time
class HistoriesController < ApplicationController
  before_action :authenticate_user!

  # Create a new history route; this is used to create comments on subjects.
  def create
    redirect_to root_url unless current_user.can_create_subject_history?
    history = History.new(comment: params.permit(:comment)[:comment])
    history.created_by = current_user.email
    history.patient_id = params.permit(:patient_id)[:patient_id]
    history.history_type = params.permit(:type)[:type] || 'Comment'
    history.save
    redirect_back fallback_location: root_path
  end
end
