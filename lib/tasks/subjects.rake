namespace :subject do
    
    desc "Run the close subjects rake task"
    task close_subjects: :environment do
        CloseSubjectsJob.perform_now()
    end

end