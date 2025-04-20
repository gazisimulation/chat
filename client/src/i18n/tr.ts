export const trTranslations = {
  app: {
    title: "GüvenliSohbet"
  },
  
  auth: {
    title: "Güvenli Giriş",
    subtitle: "Kimlik bilgilerinizle giriş yapın veya kayıt olun",
    login: "Giriş",
    register: "Kayıt Ol",
    username: "Kullanıcı Adı",
    usernamePlaceholder: "Kullanıcı adınızı girin",
    password: "Şifre",
    passwordPlaceholder: "Şifrenizi girin",
    confirmPassword: "Şifreyi Onayla",
    confirmPasswordPlaceholder: "Şifrenizi onaylayın",
    passwordHashNotice: "Şifre SHA256 ile hashlenecek",
    securityNotice: "Tüm veriler şifrelenir ve güvenli bir şekilde saklanır",
    loggingIn: "Giriş yapılıyor...",
    registering: "Kayıt olunuyor..."
  },
  
  login: {
    success: "Giriş başarılı",
    welcome: "Tekrar hoş geldiniz, {{username}}",
    failed: "Giriş başarısız"
  },
  
  register: {
    success: "Kayıt başarılı",
    welcome: "GüvenliSohbet'e hoş geldiniz",
    failed: "Kayıt başarısız"
  },
  
  logout: {
    success: "Çıkış yapıldı",
    message: "Başarıyla çıkış yaptınız",
    failed: "Çıkış başarısız"
  },
  
  user: {
    yourId: "ID'niz",
    copyId: "ID'yi Kopyala",
    idCopied: "ID kopyalandı",
    idCopiedDescription: "ID'niz panoya kopyalandı",
    logout: "Çıkış Yap",
    deleteAccount: "Hesabı Sil",
    deleteConfirmTitle: "Hesabı Sil",
    deleteConfirmDescription: "Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm mesajlarınızı ve kişilerinizi kalıcı olarak siler."
  },
  
  contacts: {
    title: "Kişiler",
    enterIdPlaceholder: "ID girin",
    addContact: "Kişi Ekle",
    encrypted: "Şifreli",
    noContacts: "Henüz kişi yok",
    addedTitle: "Kişi eklendi",
    addedDescription: "Kişi başarıyla eklendi",
    addFailedTitle: "Kişi eklenemedi"
  },
  
  messages: {
    typePlaceholder: "Şifrelenmiş bir mesaj yazın...",
    send: "Gönder",
    encrypted: "Şifreli",
    noMessages: "Henüz mesaj yok",
    sendFailedTitle: "Mesaj gönderilemedi",
    setKeyFirst: "Önce şifreleme anahtarını ayarlayın",
    expire: "Mesajlar 10 dakika sonra silinir",
    expiringIn: "{{time}} dakika içinde silinecek",
    sent: "Gönderildi",
    received: "Alındı",
    cannotDecrypt: "[Mesaj çözülemiyor. Önce şifreleme anahtarını ayarlayın]",
    emptyMessage: "Boş mesaj",
    emptyMessageDescription: "Boş mesaj gönderemezsiniz"
  },
  
  chat: {
    selectContact: "Sohbete başlamak için bir kişi seçin",
    noContacts: "Sohbete başlamak için bir kişi ekleyin",
    deleteChat: "Sohbeti Sil",
    deletedTitle: "Sohbet silindi",
    deletedDescription: "Tüm mesajlar silindi",
    deleteFailedTitle: "Sohbet silinemedi",
    deleteConfirmTitle: "Sohbeti Sil",
    deleteConfirmDescription: "Bu sohbeti silmek istediğinizden emin misiniz? Tüm mesajlar kalıcı olarak silinecektir."
  },
  
  encryption: {
    setKey: "Anahtar Ayarla",
    keySet: "Anahtar ayarlandı",
    noKey: "Anahtar ayarlanmadı",
    endToEnd: "AES256 ile uçtan uca şifreli",
    setKeyTitle: "Şifreleme Anahtarını Ayarla",
    setKeyDescription: "Mesajlarınızı güvence altına almak için bir şifreleme anahtarı girin. Bu anahtarı, bu uygulama dışında güvenli bir kanal aracılığıyla kişinizle paylaşın.",
    key: "Şifreleme Anahtarı",
    keyPlaceholder: "Şifreleme anahtarını girin",
    confirmKey: "Şifreleme Anahtarını Onayla",
    confirmKeyPlaceholder: "Şifreleme anahtarını onaylayın",
    shareKeySecurely: "Bu anahtarı, bu uygulama dışında güvenli bir şekilde kişinizle paylaşın",
    warning: "Tüm mesajlar bu anahtarı kullanarak AES256 ile şifrelenecektir. Siz veya kişiniz bu anahtarı kaybederseniz, mesajlar çözülemez.",
    saveKey: "Anahtarı Kaydet",
    keySetTitle: "Anahtar başarıyla ayarlandı",
    keySetDescription: "Mesajlarınız artık verilen anahtarla şifreleniyor",
    noKeyError: "Şifreleme anahtarı ayarlanmadı. Önce bir anahtar ayarlayın."
  },
  
  account: {
    deleted: "Hesap silindi",
    deletedMessage: "Hesabınız kalıcı olarak silindi",
    deleteFailed: "Hesap silinemedi"
  },
  
  common: {
    cancel: "İptal",
    delete: "Sil",
    save: "Kaydet",
    edit: "Düzenle",
    remove: "Kaldır"
  }
};
