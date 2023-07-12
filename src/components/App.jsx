import { useState, useEffect } from 'react';
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
  const [showModal, setShowModal] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    if (!query) { 
      return;
    }
    async function getData(page) {
      try {
        const data = await fetchImg(query, page);
        if (!data.total) {
          throw new Error(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        }
        setGallery(data.hits);
        setTotalPages(Math.ceil(data.totalHits / 12));
        setStatus('resolved');
      } catch (error) {
        setError(error);
        setStatus('rejected');
      }
    }

    setPage(1);
    setStatus('pending');
    getData(1);
  }, [query]);

  async function loadMore() {
    const currentPage = page + 1;
    try {
      const data = await fetchImg(query, currentPage);
      if (currentPage > totalPages) {
        return;
      }
      setPage(currentPage);
      setGallery(prev => prev.concat(data.hits));
    } catch (error) {
      setError(error);
      setStatus('rejected');
    }
  }

  const handleSearch = query => {
    setQuery(query);
  };

  const toggleModal = image => {
    setSelectedImg(image);
    setShowModal(prev => !prev);
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
      {showModal && <Modal img={selectedImg} toggleModal={toggleModal} />}
      <ToastContainer autoClose={3000} theme="colored" />
    </div>
  );
}
