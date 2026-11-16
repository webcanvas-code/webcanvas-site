<?php
error_reporting(0); // Wyłącz raportowanie błędów, aby nie psuć JSON-a
header('Content-Type: application/json');

// Konfiguracja
$to = 'kontakt@web-canvas.pl';
$subject_prefix = 'Nowe zgłoszenie ze strony WebCanvas: ';

// Sprawdzenie metody żądania
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Pobranie typu formularza
    $form_type = $_POST['form_type'] ?? 'contact'; 

    // Dane wspólne
    $email_input = $_POST["email"] ?? '';
    $from = filter_var(trim($email_input), FILTER_SANITIZE_EMAIL);
    
    // Walidacja email
    $errors = [];
    if (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Nieprawidłowy adres email.";
    }

    $email_content = "";
    $subject = "";

    if ($form_type === 'contact') {
        // --- LOGIKA FORMULARZA KONTAKTOWEGO ---
        // Usuń znaki nowej linii, bo imię trafia do tematu maila (header injection)
        $name = mb_substr(str_replace(["\r", "\n"], ' ', strip_tags(trim($_POST["name"] ?? ''))), 0, 100);
        $message = trim($_POST["message"] ?? '');

        if (empty($name)) $errors[] = "Pole Imię i Nazwisko jest wymagane.";
        if (empty($message)) $errors[] = "Treść wiadomości jest wymagana.";

        $subject = $subject_prefix . $name;
        $email_content = "Otrzymałeś nową wiadomość z formularza kontaktowego:\n\n";
        $email_content .= "Imię i Nazwisko: $name\n";
        $email_content .= "Email: $from\n";
        $project_type = mb_substr(strip_tags(trim($_POST['project_type'] ?? '')), 0, 100);
        if ($project_type !== '') $email_content .= "Rodzaj projektu: $project_type\n";
        $email_content .= "\nWiadomość:\n$message\n\n";

    } elseif ($form_type === 'wizard') {
        // --- KREATOR WYCENY (/wycena.html) ---
        // Pułapka na boty: ukryte pole musi zostać puste. Udajemy sukces, żeby bot nie próbował dalej.
        if (!empty($_POST['website'])) {
            http_response_code(200);
            echo json_encode(["success" => "true", "message" => "Wiadomość została wysłana."]);
            exit;
        }

        $clean = function ($v, $max = 200) {
            if (is_array($v)) $v = implode(', ', $v);
            return mb_substr(trim(strip_tags((string)$v)), 0, $max);
        };
        $line = function ($v) use ($clean) { return str_replace(["\r", "\n"], ' ', $clean($v)); };

        $name = $line($_POST['name'] ?? '');
        $service = $line($_POST['service'] ?? '');
        if (empty($name)) $errors[] = "Pole Imię jest wymagane.";
        if (empty($service)) $errors[] = "Wybierz usługę.";

        $fields = [
            'Usługa' => 'service',
            'Liczba podstron' => 'pages',
            'Cel strony' => 'goal',
            'Liczba produktów' => 'products',
            'Funkcje' => 'features',
            'Problemy obecnej strony' => 'problems',
            'Kanały marketingu' => 'channels',
            'Budżet na projekt (netto)' => 'budget',
            'Budżet miesięczny' => 'budget_monthly',
            'Obecna strona' => 'url',
            'Materiały klienta' => 'materials',
            'Termin' => 'timeline',
            'Szacunek pokazany klientowi' => 'estimate',
        ];

        $subject = "Kreator wyceny: $service, $name";
        $email_content = "Nowe zapytanie z kreatora wyceny (web-canvas.pl/wycena.html)\n\n";
        $email_content .= "KONTAKT\n";
        $email_content .= "Imię: $name\n";
        $company_name = $line($_POST['company'] ?? '');
        if ($company_name !== '') $email_content .= "Firma: $company_name\n";
        $email_content .= "Email: $from\n";
        $phone = $line($_POST['phone'] ?? '');
        if ($phone !== '') $email_content .= "Telefon: $phone\n";
        $pref = $line($_POST['contact_pref'] ?? '');
        if ($pref !== '') $email_content .= "Preferowany kontakt: $pref\n";

        $email_content .= "\nPROJEKT\n";
        foreach ($fields as $label => $key) {
            if (!isset($_POST[$key])) continue;
            $val = $line($_POST[$key], 500);
            if ($val !== '') $email_content .= "$label: $val\n";
        }
        $app = $clean($_POST['app_description'] ?? '', 3000);
        if ($app !== '') $email_content .= "\nOpis aplikacji:\n$app\n";
        $message = $clean($_POST['message'] ?? '', 3000);
        if ($message !== '') $email_content .= "\nDodatkowe informacje:\n$message\n";

        $tracking = $clean($_POST['tracking'] ?? '', 1500);
        if ($tracking !== '') $email_content .= "\nŹRÓDŁO (UTM)\n$tracking\n";
    }

    // Jeśli są błędy, zwróć je
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(["success" => "false", "message" => implode(" ", $errors)]);
        exit;
    }

    // Nagłówki - Ustawiamy 'From' na adres serwera, a 'Reply-To' na adres klienta
    // Zapobiega to odrzucaniu maili przez filtry antyspamowe
    $headers = "From: WebCanvas Form <$to>\r\n";
    $headers .= "Reply-To: $from\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Wysłanie maila
    if (mail($to, $subject, $email_content, $headers)) {
        http_response_code(200);
        echo json_encode(["success" => "true", "message" => "Wiadomość została wysłana."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => "false", "message" => "Błąd serwera. Nie udało się wysłać wiadomości."]);
    }

} else {
    // Nieprawidłowa metoda
    http_response_code(403);
    echo json_encode(["success" => "false", "message" => "Wystąpił problem z przesłaniem formularza."]);
}
?>
