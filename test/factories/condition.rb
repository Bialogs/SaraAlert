# frozen_string_literal: true

FactoryBot.define do
  factory :condition do
    transient do
      symptoms_count { 0 }
    end

    after(:create) do |condition, evaluator|
      evaluator.symptoms_count.times do
        condition.symptoms << create(:symptom)
      end
    end
  end
end
