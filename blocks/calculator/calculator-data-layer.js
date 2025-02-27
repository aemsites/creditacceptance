function getCreditScoreLabel(block) {
  const creditScoreElement = block.querySelector('#credit-score');
  const selectedOptionField = creditScoreElement.querySelector(`option[value="${creditScoreElement?.value}"]`);
  return selectedOptionField?.textContent;
}

function getFieldLabel(block, fieldId) {
  const field = block.querySelector(`#${fieldId}`);
  const wrapperDiv = field.closest('.calculator-form-field');
  return wrapperDiv?.dataset.label || '';
}

function parseFromString(value) {
  if (!value) return undefined;
  return parseFloat(value.replace(/[^0-9.-]+/g, ''));
}

export default function pushCalculatorDataLayer(block, fieldId) {
  const isMonthly = block.classList.contains('monthly');

  const cacAnalytics = {
    is_spa: true,
    vehicle_type: block.querySelector('#type-of-auto').value,
    down_payment: parseFromString(block.querySelector('#down-payment').value),
    user_state: block.querySelector('#us-states').value,
    interest_rate: parseFromString(block.querySelector('#interest-rate').value),
    credit_score_range: getCreditScoreLabel(block),
    length_of_loan: block.querySelector('#length-of-loan').value,
    event_type: 'cac-calculator-event',
    field_label: getFieldLabel(block, fieldId),
  };

  if (isMonthly) {
    cacAnalytics.tool_name = 'monthly payment calculator';
    cacAnalytics.vehicle_price = parseFromString(block.querySelector('#auto-price').value);
    cacAnalytics.monthly_payment_estimate = parseFromString(block.querySelector('#estimated-monthly-price')?.textContent);
  } else {
    cacAnalytics.tool_name = 'auto affordability calculator';
    cacAnalytics.preferred_monthly_payment = parseFromString(block.querySelector('#preferred-monthly-payment').value);
    cacAnalytics.auto_affordability_estimate = parseFromString(block.querySelector('#estimated-auto-price').textContent);
  }

  window.adobeDataLayer = window.adobeDataLayer || [];
  window.cacAnalytics = cacAnalytics;
  window.adobeDataLayer.push(cacAnalytics);
}
