import debounce from 'lodash.debounce';
import { Notify } from 'notiflix';
import './css/styles.css';
import { fetchCountries } from './js/fetchCountries';

const refs = {
  input: document.querySelector('#search-box'),
  countriesList: document.querySelector('.country-list'),
  countryCard: document.querySelector('.country-info'),
};

const DEBOUNCE_DELAY = 300;

refs.input.addEventListener('input', debounce(onInputType, DEBOUNCE_DELAY));

function onInputType(event) {
  const inputValue = event.target.value.trim();

  if (inputValue) {
    fetchCountries(inputValue)
      .then(data => {
        return data.json();
      })
      .then(countries => {
        if (countries.status === 404) {
          throw 404;
        }
        const countriesCount = countries.length;

        if (countriesCount > 10) {
          showLimitExceededAlert();
          return;
        }

        if (countriesCount >= 2 && countriesCount <= 10) {
          insertMarkupInList(makeCountriesListMarkup(countries));
          return;
        }

        insertMarkupInCard(makeCountryCardMarkup(countries));
      })
      .catch(error => {
        if (error === 404) {
          Notify.failure('Oops, there is no country with that name', {
            position: 'center-top',
          });
        } else {
          console.log(error);
        }
      });
  }
  cleanMarkup();
}

function insertMarkupInList(markUp) {
  cleanMarkup();
  refs.countriesList.insertAdjacentHTML('beforeend', markUp);
}

function insertMarkupInCard(markUp) {
  cleanMarkup();
  refs.countryCard.insertAdjacentHTML('beforeend', markUp);
}

function makeCountryCardMarkup(countriesDataList) {
  return countriesDataList
    .map(({ name, capital, population, flags, languages }) => {
      return `<div class="country-name-wrapper">
                <img src="${flags.svg}" alt="flag" width="30">
                <h2>${name.official}</h2>
              </div>
              <p><b>Capital: </b>${capital}</p>
              <p><b>Population: </b>${population.toLocaleString('en-US')}</p>
              <p><b>Languages: </b>${Object.values(languages).join(', ')}</p>`;
    })
    .join('');
}

function makeCountriesListMarkup(countriesDataList) {
  return countriesDataList
    .map(({ name, flags }) => {
      return `<li>
                <div class="country-name-wrapper">
                  <img src="${flags.svg}" alt="flag" width="30">
                  <p class="country-name">${name.official}</p>
                </div>
              </li>`;
    })
    .join('');
}

function showLimitExceededAlert() {
  Notify.info('Too many matches found. Please enter a more specific name.', {
    position: 'center-top',
  });
}

function cleanMarkup() {
  refs.countriesList.innerHTML = '';
  refs.countryCard.innerHTML = '';
}
