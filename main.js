import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, X, Check, Wifi, WifiOff, FileText } from 'lucide-react';

// Firebase imports (CDN üzerinden yüklenecek)
const firebase = window.firebase;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDe99NRp66FhLecZz9s9Z6Yq6di1KWbJAs",
  authDomain: "toplanti-odasi-251f1.firebaseapp.com",
  projectId: "toplanti-odasi-251f1",
  storageBucket: "toplanti-odasi-251f1.firebasestorage.app",
  messagingSenderId: "687713211129",
  appId: "1:687713211129:web:cecb3a3ad1bb7ac8980828",
  measurementId: "G-FCX21ZFB51"
};

// Saatler 08:00-20:00 arası
const ALL_TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];
  
  export default function MeetingRoomBooking() {
    const [bookings, setBookings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({ startTime: '', endTime: '', name: '', description: '' });
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [db, setDb] = useState(null);
  
    // Firebase'i başlat
    useEffect(() => {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        const database = firebase.database();
        setDb(database);
        setIsConnected(true);
  
        const connectedRef = database.ref('.info/connected');
        connectedRef.on('value', (snap) => {
          setIsConnected(snap.val() === true);
        });
  
        return () => connectedRef.off();
      } catch (error) {
        console.error('Firebase başlatma hatası:', error);
        setIsConnected(false);
        setIsLoading(false);
      }
    }, []);
  
    // Rezervasyonları dinle
    useEffect(() => {
      if (!db) return;
  
      const bookingsRef = db.ref('bookings');
      
      const handleData = (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const bookingsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setBookings(bookingsArray);
        } else {
          setBookings([]);
        }
        setIsLoading(false);
      };
  
      bookingsRef.on('value', handleData);
  
      return () => bookingsRef.off('value', handleData);
    }, [db]);
  
    const today = new Date().toISOString().split('T')[0];
  
    // Şu anki saati al
    const getCurrentHour = () => {
      return new Date().getHours();
    };
  
    // Bugün için geçmiş saatleri filtrele
    const getAvailableTimeSlots = () => {
      if (selectedDate !== today) {
        return ALL_TIME_SLOTS;
      }
      
      const currentHour = getCurrentHour();
      return ALL_TIME_SLOTS.filter(slot => {
        const slotHour = parseInt(slot.split(':')[0]);
        return slotHour >= currentHour;
      });
    };
  
    // Rezervasyon ekle
    const addBooking = async () => {
      if (!modalData.name.trim() || !modalData.startTime || !modalData.endTime || !db) return;
  
      const startIdx = ALL_TIME_SLOTS.indexOf(modalData.startTime);
      const endIdx = ALL_TIME_SLOTS.indexOf(modalData.endTime);
  
      if (startIdx >= endIdx) {
        alert('Bitiş saati başlangıç saatinden sonra olmalıdır!');
        return;
      }
  
      try {
        const newBooking = {
          date: selectedDate,
          startTime: modalData.startTime,
          endTime: modalData.endTime,
          name: modalData.name.trim(),
          description: modalData.description.trim(),
          createdAt: new Date().toISOString()
        };
  
        await db.ref('bookings').push(newBooking);
        
        setShowModal(false);
        setModalData({ startTime: '', endTime: '', name: '', description: '' });
      } catch (error) {
        console.error('Rezervasyon eklenirken hata:', error);
        alert('Rezervasyon eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    };
  
    // Rezervasyon sil
    const deleteBooking = async (id) => {
      if (!db) return;
      
      try {
        await db.ref(`bookings/${id}`).remove();
      } catch (error) {
        console.error('Rezervasyon silinirken hata:', error);
        alert('Rezervasyon silinirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    };
  
    // Saat diliminin dolu olup olmadığını kontrol et
    const isSlotBooked = (timeSlot) => {
      const slotIdx = ALL_TIME_SLOTS.indexOf(timeSlot);
      
      return bookings.some(b => {
        if (b.date !== selectedDate) return false;
        
        const startIdx = ALL_TIME_SLOTS.indexOf(b.startTime);
        const endIdx = ALL_TIME_SLOTS.indexOf(b.endTime);
        
        return slotIdx >= startIdx && slotIdx < endIdx;
      });
    };
  
    // O saati içeren rezervasyonu bul
    const getBookingForSlot = (timeSlot) => {
      const slotIdx = ALL_TIME_SLOTS.indexOf(timeSlot);
      
      return bookings.find(b => {
        if (b.date !== selectedDate) return false;
        
        const startIdx = ALL_TIME_SLOTS.indexOf(b.startTime);
        const endIdx = ALL_TIME_SLOTS.indexOf(b.endTime);
        
        return slotIdx >= startIdx && slotIdx < endIdx;
      });
    };
  
    // Rezervasyonun ilk saati mi kontrol et
    const isFirstSlotOfBooking = (timeSlot, booking) => {
      return booking && booking.startTime === timeSlot;
    };
  
    // Modal aç
    const openModal = (timeSlot) => {
      if (isSlotBooked(timeSlot) || !isConnected) return;
      setModalData({ startTime: timeSlot, endTime: '', name: '', description: '' });
      setShowModal(true);
    };
  
    // Bitiş saati seçeneklerini al
    const getEndTimeOptions = () => {
      if (!modalData.startTime) return [];
      
      const startIdx = ALL_TIME_SLOTS.indexOf(modalData.startTime);
      const availableSlots = ALL_TIME_SLOTS.slice(startIdx + 1);
      
      // Dolu olan saatlere kadar seçenekleri göster
      const options = [];
      for (let i = 0; i < availableSlots.length; i++) {
        const slot = availableSlots[i];
        if (isSlotBooked(slot)) break;
        options.push(slot);
      }
      
      return options;
    };
  
    // Tarih formatla
    const formatDate = (dateStr) => {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('tr-TR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };
  
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Yükleniyor...</p>
          </div>
        </div>
      );
    }
  
    const availableTimeSlots = getAvailableTimeSlots();
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Toplantı Odası</h1>
            </div>
  
            {/* Bağlantı Durumu */}
            <div className={`flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-lg ${
              isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Çevrimiçi</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-medium">Bağlantı Yok</span>
                </>
              )}
            </div>
            
            {/* Tarih Seçici */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih Seçin
              </label>
              <input
                type="date"
                value={selectedDate}
                min={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              />
            </div>
            
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl">
              <p className="text-center text-indigo-900 font-medium">
                {formatDate(selectedDate)}
              </p>
            </div>
          </div>
  
          {/* Saat Dilimleri */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">Rezervasyon Saatleri</h2>
            </div>
  
            <div className="space-y-3">
              {availableTimeSlots.map((slot) => {
                const booking = getBookingForSlot(slot);
                const isBooked = !!booking;
                const isFirstSlot = isFirstSlotOfBooking(slot, booking);
  
                return (
                  <div
                    key={slot}
                    onClick={() => !isBooked && isConnected && openModal(slot)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isBooked
                        ? 'bg-red-50 border-red-200 cursor-not-allowed'
                        : isConnected
                        ? 'bg-green-50 border-green-200 cursor-pointer hover:shadow-md hover:scale-102 active:scale-98'
                        : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                          isBooked ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                        }`}>
                          {slot.split(':')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800">{slot}</p>
                          {isBooked && isFirstSlot ? (
                            <div className="mt-1">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-700 font-medium truncate">{booking.name}</p>
                              </div>
                              <p className="text-xs text-red-600 mt-1">
                                {booking.startTime} - {booking.endTime}
                              </p>
                              {booking.description && (
                                <div className="flex items-start gap-1 mt-1">
                                  <FileText className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-red-600 line-clamp-2">{booking.description}</p>
                                </div>
                              )}
                            </div>
                          ) : isBooked ? (
                            <p className="text-xs text-red-600 mt-1">Devam ediyor...</p>
                          ) : (
                            <p className="text-sm text-green-600">Müsait</p>
                          )}
                        </div>
                      </div>
                      
                      {isBooked && isFirstSlot && isConnected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Bu rezervasyonu silmek istediğinize emin misiniz?')) {
                              deleteBooking(booking.id);
                            }
                          }}
                          className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors flex-shrink-0"
                        >
                          <X className="w-5 h-5 text-red-600" />
                        </button>
                      )}
                      
                      {!isBooked && isConnected && (
                        <Plus className="w-6 h-6 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
  
          {/* İstatistik */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">
                  {availableTimeSlots.filter(slot => !isSlotBooked(slot)).length}
                </p>
                <p className="text-sm text-gray-600">Müsait Saat</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-600">
                  {availableTimeSlots.filter(slot => isSlotBooked(slot)).length}
                </p>
                <p className="text-sm text-gray-600">Dolu Saat</p>
              </div>
            </div>
          </div>
        </div>
  
        {/* Rezervasyon Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Rezervasyon Yap</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
  
              <div className="mb-4 p-4 bg-indigo-50 rounded-xl">
                <p className="text-sm text-gray-600">Tarih</p>
                <p className="font-semibold text-indigo-900">{formatDate(selectedDate)}</p>
              </div>
  
              {/* Başlangıç Saati */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Saati
                </label>
                <input
                  type="text"
                  value={modalData.startTime}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-lg font-semibold"
                />
              </div>
  
              {/* Bitiş Saati */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş Saati
                </label>
                <select
                  value={modalData.endTime}
                  onChange={(e) => setModalData({ ...modalData, endTime: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                >
                  <option value="">Bitiş saati seçin</option>
                  {getEndTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
  
              {/* İsim */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adınız *
                </label>
                <input
                  type="text"
                  placeholder="İsminizi girin"
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>
  
              {/* Açıklama */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Toplantı Açıklaması (Opsiyonel)
                </label>
                <textarea
                  placeholder="Örn: Proje Değerlendirme Toplantısı"
                  value={modalData.description}
                  onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
  
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={addBooking}
                  disabled={!modalData.name.trim() || !modalData.endTime}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Firebase Scripts */}
        <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
      </div>
    );
  }