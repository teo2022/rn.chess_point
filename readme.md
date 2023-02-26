Настройка окружения
https://reactnative.dev/docs/environment-setup

Установить все зависимости
npm install

Запуск приложения
npx react-native run-android
npx react-native run-ios

Debug apk
https://medium.com/geekculture/react-native-generate-apk-debug-and-release-apk-4e9981a2ea51

Release aab (не терять ключи, долго восстанавливается через тех.поддержку)
https://reactnative.dev/docs/signed-apk-android
IOS
https://www.youtube.com/watch?v=r-Z--YDrmjI&t=592s

У приложения могут быть проблемы с производительностью.
Использовать таймауты вместо интервалов, мемоизацию, хуки.
https://blog.logrocket.com/optimize-react-native-performance/

В библиотеке react-native-chessboard переписаны методы для продвижения пешки через сокеты.
Начата работа над переворотом доски. Входной файл в библиотеке для этого components/pieces
Библиотека под капотом использует chess.js
