# Хранители Времени — iOS

## Как открыть в Xcode:

1. Создай новый Xcode проект:
   - File → New → Project
   - iOS → App
   - Product Name: ClockAngleApp
   - Interface: UIKit App Delegate
   - Language: Swift
   - Bundle Identifier: com.clockgame.chronokeepers

2. Скопируй файлы из этой папки в проект:
   - AppDelegate.swift → замени
   - SceneDelegate.swift → замени
   - ViewController.swift → замени
   - Info.plist → замени
   - Assets/ → создай папку "Assets" (New Group), добавь index.html и minigames.html (Add to target)

3. В настройках проекта:
   - General → Deployment Target → iOS 14.0
   - General → Device Orientation → Portrait only

4. Нажми ⌘B (Build) или ⌘R (Run)

## Для публикации в App Store:
- Apple Developer аккаунт ($99/год)
- Product → Archive → Distribute App → App Store Connect
