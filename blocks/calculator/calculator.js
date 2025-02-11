import { createTag } from '../../libs/utils/utils.js';

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
  const downPayment = block.querySelector('#down-payment')?.value;
  const preferredMonthlyPayment = block.querySelector('#preferred-monthly-payment')?.value;

  const aprRate = interestRate / 100;
  const apprdiv12 = aprRate / 12;

  let autoPrice;
  if (interestRate > 0) {
    // eslint-disable-next-line max-len
    autoPrice = Number(preferredMonthlyPayment * (Math.pow(1 + apprdiv12, loanTerm) - 1) / (apprdiv12 * Math.pow(1 + apprdiv12, loanTerm))) + Number(downPayment);
  } else {
    autoPrice = Number(preferredMonthlyPayment * loanTerm) + Number(downPayment);
  }
  autoPrice = Math.round(autoPrice);
  block.querySelector('.calculator-result-copy').textContent = USDollar.format(autoPrice);
}

function getMonthlyPayment(block) {
  const loanTerm = block.querySelector('#length-of-loan')?.value;
  const interestRate = Number(block.querySelector('#interest-rate')?.value.replace('%', ''));
  const autoPrice = block.querySelector('#auto-price')?.value;
  const downPayment = block.querySelector('#down-payment')?.value;

  const loanAmount = autoPrice - downPayment;
  let monthlyPayment;
  if (interestRate > 0) {
    const aprRate = interestRate / 100;
    const apprdiv12 = aprRate / 12;
    // eslint-disable-next-line max-len
    monthlyPayment = (loanAmount) * (apprdiv12 * Math.pow(1 + apprdiv12, loanTerm)) / ((Math.pow(1 + apprdiv12, loanTerm) - 1));
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

function handleChange(id, value, block) {
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
  block.querySelector('#interest-rate').value = interestRate;

  calculate(block);
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
        inputElement.append(optionElement);
      });
      div.classList.add('select-box');

      inputElement.addEventListener('change', (event) => {
        handleChange(id, event.target.value, block);
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
        handleChange('us-states', event.target.value, block);
      });
    } else {
      inputElement = createTag('input', {
        name: children[0].textContent,
        id: children[0].textContent,
        type: 'text',
      });
      inputElement.setAttribute('value', defaultValue);
      div.classList.add('input-box');
      inputElement.addEventListener('change', () => {
        calculate(block);
      });
    }

    if (children[1]?.textContent.includes('*')) {
      inputElement.setAttribute('required', '');
    }

    const number = createTag('div', { class: 'calculator-number' }, `${index + 1}`);
    const label = createTag('label', { for: children[0].textContent }, children[1].textContent);
    const inputWrapper = createTag('div', { class: 'input-wrapper' }, inputElement);
    div.append(number, label, inputWrapper);
    wrapper.append(div);
    field.remove();
  }
}

function decorateDisclaimer(disclaimerField, wrapper) {
  const { children } = disclaimerField;
  if (children[0].textContent !== 'disclaimer') return;

  const bgImage = children[1].querySelector('picture');
  const title = children[1].querySelector('h2, h3, h4, h5, h6');
  const disclaimerCopy = children[1].querySelector('p:not(:first-child)');
  const link = children[1].querySelector('a');

  title.classList.add('calculator-disclaimer-title');
  disclaimerCopy.classList.add('calculator-disclaimer-copy');

  const resultCopy = createTag('p', { class: 'calculator-result-copy' });

  const results = createTag('div', { class: 'calculator-results' }, [bgImage, title, resultCopy]);
  const disclaimerCard = createTag('div', { class: 'calculator-disclaimer-card' }, [results, disclaimerCopy, link]);
  const disclaimer = createTag('div', { class: 'calculator-disclaimer' }, disclaimerCard);
  disclaimerField.remove();
  wrapper.append(disclaimer);
}

export default async function init(block) {
  const heading = block.querySelector(':scope > div:first-child');
  const fields = block.querySelectorAll(':scope > div:not(:first-child):not(:last-child)');
  const disclaimerField = block.querySelector(':scope > div:last-child');
  const form = createTag('form', { class: 'calculator-form' });
  decorateHeading(heading, form);
  await decorateInputFields(fields, form, block);

  block.append(form);

  decorateDisclaimer(disclaimerField, block);
  calculate(block);
}
