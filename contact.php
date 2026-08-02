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
        $name = strip_tags(trim($_POST["name"] ?? ''));
        $message = trim($_POST["message"] ?? '');

        if (empty($name)) $errors[] = "Pole Imię i Nazwisko jest wymagane.";
        if (empty($message)) $errors[] = "Treść wiadomości jest wymagana.";

        $subject = $subject_prefix . $name;
        $email_content = "Otrzymałeś nową wiadomość z formularza kontaktowego:\n\n";
        $email_content .= "Imię i Nazwisko: $name\n";
        $email_content .= "Email: $from\n\n";
        $email_content .= "Wiadomość:\n$message\n\n";

    } elseif ($form_type === 'quote') {
        // --- LOGIKA FORMULARZA WYCENY (kalkulator) ---
        $name        = strip_tags(trim($_POST['name'] ?? ''));
        $project_type = strip_tags(trim($_POST['calc_project_type'] ?? 'Nie wybrano'));
        $scope       = strip_tags(trim($_POST['calc_scope'] ?? ''));
        $addons      = strip_tags(trim($_POST['calc_addons'] ?? 'Brak'));
        $urgency     = strip_tags(trim($_POST['calc_urgency'] ?? ''));
        $budget      = strip_tags(trim($_POST['calc_budget'] ?? ''));
        $phone       = strip_tags(trim($_POST['phone'] ?? ''));
        $message     = strip_tags(trim($_POST['message'] ?? ''));

        $subject = "Zapytanie o wycenę ze strony WebCanvas";

        $email_content  = "Otrzymałeś nowe zapytanie o wycenę z kalkulatora:\n\n";
        $email_content .= "Imię / firma: $name\n";
        $email_content .= "Email: $from\n";
        if (!empty($phone)) $email_content .= "Telefon: $phone\n";
        $email_content .= "\n--- Szczegóły projektu ---\n";
        $email_content .= "Rodzaj projektu: $project_type\n";
        if (!empty($scope))   $email_content .= "Zakres: $scope\n";
        if (!empty($addons))  $email_content .= "Dodatki: $addons\n";
        if (!empty($urgency)) $email_content .= "Termin: $urgency\n";
        if (!empty($budget))  $email_content .= "Budżet: $budget\n";
        if (!empty($message)) $email_content .= "\nDodatkowe informacje:\n$message\n";
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
