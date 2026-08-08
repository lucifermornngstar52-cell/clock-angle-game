import UIKit
import WebKit

class ViewController: UIViewController {
    var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        
        webView = WKWebView(frame: .zero, configuration: config)
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
        
        // Загружаем index.html из Assets
        if let htmlPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "Assets"),
           let htmlURL = URL(string: "file://\(htmlPath)") {
            let dir = URL(fileURLWithPath: htmlPath).deletingLastPathComponent()
            webView.loadFileURL(htmlURL, allowingReadAccessTo: dir)
        }
        
        // Тёмный фон
        view.backgroundColor = UIColor(red: 0.02, green: 0.02, blue: 0.06, alpha: 1.0)
    }
    
    // Запрет поворота — только портрет
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return .portrait
    }
    
    // Полноэкранный режим
    override var prefersStatusBarHidden: Bool {
        return true
    }
}
