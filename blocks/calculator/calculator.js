import { createTag } from '../../libs/utils/utils.js';
import pushCalculatorDataLayer from './calculator-data-layer.js';

let usStatesData;
const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

const Percentage = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
});

function decorateHeading(headingRow, wrapper) {
  headingRow.classList.add('calculator-heading-wrapper');
  const heading = headingRow.querySelector('h1, h2, h3, h4, h5, h6');
  heading.classList.add('calculator-heading');

  headingRow.querySelectorAll('p').forEach((p) => {
    if (p.textContent.includes('*')) {
      p.classList.add('required-field-info-text');
    }
  });

  wrapper.append(headingRow);
}

function getDefaultValue(inputElement, cell) {
  if (!cell) return undefined;
  const elements = cell.querySelectorAll('p');

  if (!elements.length) return undefined;

  let value;
  elements.forEach((p) => {
    if (p.textContent.toLowerCase().includes('default value')) {
      value = p.textContent.split('-')[1].trim();
    }
  });

  return value;
}

function getOptionsLabelandValue(text) {
  const value = text.split('=')[1]?.trim().replace(']', '');
  const label = text.split('[')[0]?.trim();

  if (!value || !label) return { label: text, value: text };

  return { label, value };
}

function getAutoPrice(block) {
  const loanTerm = block.querySelector('#length-of-loan')?.value;
  const interestRate = Number(block.querySelector('#interest-rate')?.value.replace('%', ''));
  const downPayment = block.querySelector('#down-payment')?.value?.replace('$', '').replace(',', '');
  const preferredMonthlyPayment = block.querySelector('#preferred-monthly-payment')?.value?.replace('$', '').replace(',', '');

  const aprRate = interestRate / 100;
  const apprdiv12 = aprRate / 12;

  let autoPrice;
  if (interestRate > 0) {
    // eslint-disable-next-line max-len
    autoPrice = Number(preferredMonthlyPayment * (((1 + apprdiv12) ** loanTerm - 1) / (apprdiv12 * (1 + apprdiv12) ** loanTerm))) + Number(downPayment);
  } else {
    autoPrice = Number(preferredMonthlyPayment * loanTerm) + Number(downPayment);
  }
  autoPrice = Math.round(autoPrice);
  block.querySelector('.calculator-result-copy').textContent = USDollar.format(autoPrice);
}

function getMonthlyPayment(block) {
  const loanTerm = block.querySelector('#length-of-loan')?.value;
  const interestRate = Number(block.querySelector('#interest-rate')?.value.replace('%', ''));
  const autoPrice = Number(block.querySelector('#auto-price')?.value?.replace('$', '').replace(',', ''));
  const downPayment = Number(block.querySelector('#down-payment')?.value?.replace('$', '').replace(',', ''));

  const loanAmount = autoPrice - downPayment;
  let monthlyPayment;
  if (interestRate > 0) {
    const aprRate = interestRate / 100;
    const apprdiv12 = aprRate / 12;
    // eslint-disable-next-line max-len
    monthlyPayment = (loanAmount) * ((apprdiv12 * (1 + apprdiv12) ** loanTerm) / (((1 + apprdiv12) ** loanTerm - 1)));
  } else {
    monthlyPayment = loanAmount / loanTerm;
  }

  monthlyPayment = Math.round(monthlyPayment);

  if (monthlyPayment < 0) {
    monthlyPayment = 0;
  }

  block.querySelector('.calculator-result-copy').textContent = USDollar.format(monthlyPayment);
}

function calculate(block) {
  if (block.classList.contains('monthly')) {
    getMonthlyPayment(block);
  } else {
    getAutoPrice(block);
  }
}

function handleSelectFieldChange(id, value, block) {
  if (block.classList.contains('has-error')) return;

  let typeOfVehicle = block.querySelector('#type-of-auto').value;
  let state = block.querySelector('#us-states').value;
  let creditScore = block.querySelector('#credit-score').value;
  let interestRate = block.querySelector('#interest-rate').value;

  switch (id) {
    case 'type-of-auto':
      typeOfVehicle = value;
      break;
    case 'us-states':
      state = value;
      break;
    case 'credit-score':
      creditScore = value;
      break;
    default:
      break;
  }
  const object = usStatesData.find((obj) => obj.value === state);
  interestRate = object[`credit-score-${typeOfVehicle}-${creditScore}`];
  const interestRateElement = block.querySelector('#interest-rate');
  interestRateElement.value = Percentage.format(interestRate / 100);
  interestRateElement.setAttribute('value', Percentage.format(interestRate / 100));

  calculate(block);
  pushCalculatorDataLayer(block, id);
}

function addTextFieldEventListeners({ inputElement, block }) {
  const { id } = inputElement;

  inputElement.addEventListener('change', () => {
    const errorMessageElement = inputElement.parentElement?.querySelector('.error-message');
    const emptyMessageElement = inputElement.parentElement?.querySelector('.empty-message');
    errorMessageElement.classList.remove('active');
    emptyMessageElement.classList.remove('active');
    block.classList.remove('has-error');

    if (!inputElement.value) {
      emptyMessageElement.classList.add('active');
      block.classList.add('has-error');
      return;
    }

    if (id === 'interest-rate') {
      const value = Number(inputElement.value.replace('%', ''));
      if (Number.isNaN(value)) {
        errorMessageElement.classList.add('active');
        block.classList.add('has-error');
        return;
      }
      inputElement.setAttribute('value', Percentage.format(value / 100));
      inputElement.value = Percentage.format(value / 100);
    } else {
      const value = Number(inputElement.value.replace('$', '').replace(',', ''));
      if (Number.isNaN(value)) {
        errorMessageElement.classList.add('active');
        block.classList.add('has-error');
        return;
      }
      inputElement.setAttribute('value', USDollar.format(value));
      inputElement.value = USDollar.format(value);
    }

    calculate(block);
  });

  inputElement.addEventListener('focus', () => {
    inputElement.select();
  });

  inputElement.addEventListener('blur', () => {
    pushCalculatorDataLayer(block, id);
  });
}

async function decorateInputFields(fields, wrapper, block) {
  const fieldsArray = Array.from(fields);

  /* eslint-disable-next-line no-restricted-syntax */
  for (const [index, field] of fieldsArray.entries()) {
    const { children } = field;
    let inputElement;
    const defaultValue = getDefaultValue(inputElement, children[2]);
    const div = createTag('div', { class: 'calculator-form-field' });

    if (children[2]?.querySelector('ul, ol')) {
      const id = children[0].textContent;
      inputElement = createTag('select', {
        name: children[0].textContent,
        id,
      });
      const options = children[2].querySelectorAll('li');

      options.forEach((option) => {
        const { label, value } = getOptionsLabelandValue(option.textContent);
        const optionElement = createTag('option', {
          value,
        });
        if (value === defaultValue.toLowerCase()) {
          optionElement.setAttribute('selected', '');
        }
        optionElement.textContent = label;
        optionElement.dataset.label = label;
        inputElement.append(optionElement);
      });
      div.classList.add('select-box');

      inputElement.addEventListener('change', (event) => {
        handleSelectFieldChange(id, event.target.value, block);
      });
    } else if (children[2].querySelector('a')?.href.endsWith('.json')) {
      const url = children[2].querySelector('a').href;
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(url);
      if (!response.ok) return;

      // eslint-disable-next-line no-await-in-loop
      const data = await response.json();
      usStatesData = data.data;
      inputElement = createTag('select', {
        name: children[0].textContent,
        id: children[0].textContent,
      });
      usStatesData.forEach((option) => {
        const optionElement = createTag('option', { value: option.value });
        if (option.value === defaultValue) {
          optionElement.setAttribute('selected', '');
        }
        optionElement.textContent = option.name;
        inputElement.append(optionElement);
      });
      div.classList.add('select-box', index);

      inputElement.addEventListener('change', (event) => {
        handleSelectFieldChange('us-states', event.target.value, block);
      });
    } else {
      const id = children[0].textContent;
      inputElement = createTag('input', {
        name: id,
        id,
        type: 'text',
        maxLength: 5,
        value: id === 'interest-rate' ? Percentage.format(defaultValue / 100) : USDollar.format(defaultValue),
      });

      div.classList.add('input-box');
      addTextFieldEventListeners({ inputElement, defaultValue, block });
    }

    if (children[1]?.textContent.includes('*')) {
      inputElement.setAttribute('required', '');
    }

    const number = createTag('div', { class: 'calculator-number' }, `${index + 1}`);

    const labelHTML = children[1].innerHTML.replace('*', '<span class="required-asterisk">*</span>');
    const label = createTag('label', { for: children[0].textContent }, labelHTML);
    const mainLabel = children[1].textContent.split('*')[0]?.trim();
    const mainLabelLowerCase = mainLabel.toLowerCase();
    const errorMessage = createTag('div', { class: 'error-message' }, `Please enter a valid ${mainLabelLowerCase}`);
    const emptyMessage = createTag('div', { class: 'empty-message' }, `Please fill in ${mainLabelLowerCase}`);
    const inputWrapper = createTag('div', { class: 'input-wrapper' }, [inputElement, errorMessage, emptyMessage]);
    div.append(number, label, inputWrapper);
    div.dataset.label = mainLabel;
    wrapper.append(div);
    field.remove();
  }
}

function decorateResultsCard(disclaimerField, wrapper) {
  const { children } = disclaimerField;
  if (children[0].textContent !== 'disclaimer') return;

  const bgImage = children[1].querySelector('picture');
  const title = children[1].querySelector('h2, h3, h4, h5, h6');
  const disclaimerCopy = children[1].querySelector('p:not(:first-child)');
  const link = children[1].querySelector('a');

  title.classList.add('calculator-results-title');
  disclaimerCopy.classList.add('calculator-disclaimer-copy');

  const isMonthly = wrapper.classList.contains('monthly');
  const resultCopyId = isMonthly ? 'estimated-monthly-price' : 'estimated-auto-price';
  const resultCopy = createTag('p', { class: 'calculator-result-copy', id: resultCopyId });

  const results = createTag('div', { class: 'calculator-results' }, [bgImage, title, resultCopy]);
  const disclaimerCard = createTag('div', { class: 'calculator-results-card' }, [results, disclaimerCopy, link]);
  const disclaimer = createTag('div', { class: 'calculator-results-card-container', id: 'calculator-results-card-container' }, disclaimerCard);
  disclaimerField.remove();
  wrapper.append(disclaimer);
}

function buildSeeResultsButton(block) {
  const button = createTag('a', { class: 'calculator-see-results button primary', href: '#calculator-results-card-container' }, 'See Results');

  button.addEventListener('click', (event) => {
    event.preventDefault();
    const results = block.querySelector('#calculator-results-card-container');
    results.scrollIntoView({ behavior: 'smooth' });
  });

  const divWrapper = createTag('div', { class: 'calculator-see-results-wrapper' }, button);
  const form = block.querySelector('.calculator-form');
  form.insertAdjacentElement('afterend', divWrapper);
}

function addDividers(block) {
  const resultsCard = block.querySelector('.calculator-results-card-container');
  const divider = createTag('div', { class: 'calculator-divider' });
  resultsCard.insertAdjacentElement('beforebegin', divider.cloneNode(true));
  resultsCard.insertAdjacentElement('afterend', divider.cloneNode(true));
}

export default async function init(block) {
  const heading = block.querySelector(':scope > div:first-child');
  const fields = block.querySelectorAll(':scope > div:not(:first-child):not(:last-child)');
  const disclaimerField = block.querySelector(':scope > div:last-child');
  const form = createTag('form', { class: 'calculator-form' });
  decorateHeading(heading, form);
  await decorateInputFields(fields, form, block);

  block.append(form);

  decorateResultsCard(disclaimerField, block);

  // calculate the result on page load
  calculate(block);

  buildSeeResultsButton(block);
  addDividers(block);
}
