import { Web3 } from 'web3';
import { ChainlinkPlugin, MainnetPriceFeeds } from '@chainsafe/web3-plugin-chainlink';
import { useEffect, useState } from 'react';
import { Pokemons } from './pokemons';

function App() {
  const [conversionRate, setConversionRate] = useState(null); // Default to USD conversion rate
  const [query, setQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState({ name: 'usd', id: 'UsdcUsd' });
  const [result, setResult] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState(Pokemons);

  const options = [
    { name: 'usdt', id: 'UsdcUsd' },
    { name: 'eth', id: 'EthUsd' },
    { name: 'bnb', id: 'BnbUsd' },
    { name: 'btc', id: 'BtcUsd' },
  ];

  // Initialize Web3 and Chainlink
  const web3 = new Web3(window.ethereum);
  web3.registerPlugin(new ChainlinkPlugin());

  const getPrice = async (priceFeedId) => {
    try {
      const price = await web3.chainlink.getPrice(MainnetPriceFeeds[priceFeedId]);
      const formattedPrice = parseFloat(price.answer.toString()) / 1e8;// Convert to decimal
      console.log({ formattedPrice })
      return formattedPrice;
    } catch (error) {
      console.error("Error fetching price:", error);
      return 1; // Return 1 as fallback (default USD conversion)
    }
  };

  const handleSelectChange = async (e) => {
    const selectedId = e.target.value;
    const selectedPriceOption = options.find(option => option.id === selectedId);
    setSelectedOption(selectedPriceOption);

    const price = await getPrice(selectedId);
    setConversionRate(price);
    // After setting the conversion rate, recalculate the results
    calculateResult(filteredPokemons, price);
  };

  const calculateResult = (pokemonList, conversionRate) => {
    const calculatedResults = pokemonList.map(pokemon => ({
      ...pokemon,
      convertedPrice: (conversionRate * pokemon.usdtPrice).toFixed(6)
    }));
    setResult(calculatedResults);
  };

  useEffect(() => {
    const getInitialPrice = async () => {
      try {
        const value = await web3.chainlink.getPrice(MainnetPriceFeeds[options[0].id]);
        const formattedValue = parseFloat(value.answer.toString()) / 1e8; // Convert to the appropriate decimal
        return formattedValue;
      } catch (error) {
        console.error("Error fetching initial price:", error);
        return 1; // Return 1 as a fallback (default USD conversion)
      }
    };

    const fetchAndSetInitialPrice = async () => {
      const defaultPrice = await getInitialPrice();
      console.log({ defaultPrice });
      calculateResult(Pokemons, defaultPrice);
    };

    fetchAndSetInitialPrice();
  }, []);


  const handleSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setQuery(searchQuery);

    const results = searchQuery === '' ? Pokemons : Pokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchQuery)
    );
    setFilteredPokemons(results);
    calculateResult(results, conversionRate);
  };

  return (
    <>
      <header className="w-full h-12 flex justify-between items-center border-b border-gray-600 px-2 md:px-10">
        <img src='./assets/Pokémon_logo_English.png' alt='pokemon log' className='w-16 h-8' />
        <select id="priceSelect" value={selectedOption.id} onChange={handleSelectChange} className='w-24 py-1 focus:outline-none rounded-md bg-gray-700 text-white'>
          {options.map((option, index) => (
            <option className='hover:bg-purple-600 p-2' key={index} value={option.id}>
              {option.name.toUpperCase()}
            </option>
          ))}
        </select>
      </header>
      <main className="w-full h-full md:h-[100vh-220px] flex flex-col gap-1 text-white my-1 bg-transparent">
        <div className="flex flex-col gap-8 items-center justify-center ">
          <div className='flex flex-col gap-2 text-center'>
            <span className='text-xs md:text-xl font-mono'>Buy Pokémons</span>
            <input
              type="text"
              placeholder="Search Pokémons..."
              value={query}
              onChange={handleSearch}
              className="py-2 px-7 rounded-full focus:outline-none bg-slate-700"
            />
          </div>
          <ul className="w-44 md:w-[540px] text-white text-center items-center justify-center gap-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {result.map((pokemon, index) => (
              <div>
                <li key={index} className='border border-gray-500 rounded-lg flex gap-2 flex-col py-4 px-2 hover:bg-purple-600 bg-slate-700'>
                  <img src={pokemon.image} alt={pokemon.name} className='w-full h-24 bg-transparent' />
                  <div className='w-full justify-center items-center flex gap-2 bg-transparent'>
                    <span className='bg-transparent'>{pokemon.name}</span>
                    <button className='px-1 border border-gray-200 rounded-lg text-white hover:bg-slate-600'>buy</button>
                  </div>
                </li>
                <div className='flex gap-1 justify-center items-center'>
                  <span> {pokemon.convertedPrice}</span>
                  <span>{selectedOption.name.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </ul>
        </div>
      </main>
      <footer className='w-full h-12 flex text-center items-center justify-center text-white'>
        <span>made with ❤️ by <a href='https://github.com/AngeloKwakye/web3bounty' className='underline'>D'Angelo Kwakye</a></span>
      </footer>
    </>
  );
}

export default App;
