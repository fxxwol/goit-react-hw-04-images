import { useState, useEffect, useCallback } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import SearchBar from './SearchBar';
import ImageGallery from './ImageGallery';
import Modal from './Modal';
import { fetchImg } from 'service/fetchImg';
import Loader from './Loader';
import Button from './Button';

export default function App() {
  const [gallery, setGallery] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [selectedImg, setSelectedImg] = useState(null);

  const getData = useCallback(async page => {
    try {
      const data = await fetchImg(query, page);
      if (!data.total) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      setGallery(prev => [...prev, ...data.hits]);
      setTotalPages(Math.ceil(data.totalHits / 12));
      setPage(page)
      setStatus('resolved');
    } catch (error) {
      setError(error);
      setStatus('rejected');
    }
  }, [query]);

  useEffect(() => {
    if (!query) {
      return;
    }
    setStatus('pending');
    getData(1);
  }, [getData, query]);

   function loadMore() {
    const currentPage = page + 1;
    if (currentPage > totalPages) {
      return;
     }
     getData(currentPage)
  }

  const handleSearch = query => {
    setQuery(query);
    setPage(1);
    setGallery([]);
  };

  const toggleModal = image => {
    setSelectedImg(image);
  };

  return (
    <div className="App">
      <SearchBar onSubmit={handleSearch} />
      {status === 'pending' && <Loader />}
      {status === 'resolved' && (
        <>
          <ImageGallery gallery={gallery} onModalClick={toggleModal} />
          {!(page === totalPages) && <Button onClick={loadMore} />}
        </>
      )}
      {status === 'rejected' && <h1>{error.message}</h1>}
      {selectedImg && <Modal img={selectedImg} toggleModal={toggleModal} />}
      <ToastContainer autoClose={3000} theme="colored" />
    </div>
  );
}
