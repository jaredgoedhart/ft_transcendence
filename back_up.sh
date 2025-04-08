#!/bin/bash


# Description: Script to easily back up all files and generate the directory structure in a "back_up" directory.


# Location: This script should be placed in the root directory.


# Create the "back_up" directory if it does not exist
UPLOAD_DIRECTORY="./back_up"

if [ ! -d "$UPLOAD_DIRECTORY" ]
then
    mkdir "$UPLOAD_DIRECTORY"
fi


# Define the list of files to copy
files=(
    "backend/Dockerfile"
    "backend/.dockerignore"
    "backend/package.json"
    "backend/tsconfig.json"
    "backend/src/config/database.ts"
    "backend/src/controllers/authentication_controller.ts"
    "backend/src/controllers/friendship_controller.ts"
    "backend/src/controllers/match_controller.ts"
    "backend/src/controllers/online_status_controller.ts"
    "backend/src/controllers/two_factor_controller.ts"
    "backend/src/controllers/user_avatar_controller.ts"
    "backend/src/controllers/user_controller.ts"
    "backend/src/controllers/gdpr_controller.ts"
    "backend/src/controllers/google_auth_controller.ts"
    "backend/src/models/friendship.ts"
    "backend/src/models/match.ts"
    "backend/src/models/user.ts"
    "backend/src/plugins/cors.ts"
    "backend/src/plugins/jwt.ts"
    "backend/src/plugins/multipart.ts"
    "backend/src/plugins/static.ts"
    "backend/src/plugins/websocket.ts"
    "backend/src/routes/authentication_routes.ts"
    "backend/src/routes/friendship_routes.ts"
    "backend/src/routes/match_routes.ts"
    "backend/src/routes/online_status_routes.ts"
    "backend/src/routes/two_factor_routes.ts"
    "backend/src/routes/user_routes.ts"
    "backend/src/routes/gdpr_routes.ts"
    "backend/src/services/file_service.ts"
    "backend/src/services/friendship_service.ts"
    "backend/src/services/match_service.ts"
    "backend/src/services/online_status_service.ts"
    "backend/src/services/two_factor_service.ts"
    "backend/src/services/user_service.ts"
    "backend/src/types/fastify.d.ts"
    "backend/src/types/modules.d.ts"
    "backend/src/index.ts"
    "docker/nginx/cert/cert.pem"
    "docker/nginx/cert/key.pem"
    "docker/nginx/ssl/nginx.crt"
    "docker/nginx/ssl/nginx.key"
    "docker/nginx/Dockerfile"
    "docker/nginx/nginx.conf"
    "frontend/public/index.html"
    "frontend/Dockerfile"
    "frontend/.env"
    "frontend/package.json"
    "frontend/postcss.config.js"
    "frontend/tailwind.config.js"
    "frontend/tsconfig.json"
    "frontend/src/components/Auth/LoginForm.tsx"
    "frontend/src/components/Auth/RegisterForm.tsx"
    "frontend/src/components/Auth/GoogleSignIn.tsx"
    "frontend/src/components/Game/ContinueTournament.tsx"
    "frontend/src/components/Game/DirectMatch.tsx"
    "frontend/src/components/Game/GameControls.tsx"
    "frontend/src/components/Game/GameLogic.ts"
    "frontend/src/components/Game/InputValidation.ts"
    "frontend/src/components/Game/KeyboardControls.ts"
    "frontend/src/components/Game/Match.tsx"
    "frontend/src/components/Game/MatchSchedule.tsx"
    "frontend/src/components/Game/PlayerRegistrationForm.tsx"
    "frontend/src/components/Game/PlayersList.tsx"
    "frontend/src/components/Game/RenderGame.tsx"
    "frontend/src/components/Game/ScoreDisplay.tsx"
    "frontend/src/components/Game/StartTournament.tsx"
    "frontend/src/components/Game/TokenValidation.ts"
    "frontend/src/components/Game/TournamentUtils.ts"
    "frontend/src/components/Game/MultiplayerGame.tsx"
    "frontend/src/components/Game/Types.ts"
    "frontend/src/components/Game/ValidatePlayer.tsx"
    "frontend/src/components/Game/TournamentSummary.tsx"
    "frontend/src/components/Game/FinalTournamentMatch.tsx"
    "frontend/src/components/User/FriendsList.tsx"
    "frontend/src/components/User/TwoFactorSettings.tsx"
    "frontend/src/components/User/UserAvatar.tsx"
    "frontend/src/components/User/UserProfile.tsx"
    "frontend/src/components/User/UserStats.tsx"
    "frontend/src/components/User/GameSessionDashboard.tsx"
    "frontend/src/components/User/GDPRSettings.tsx"
    "frontend/src/context/AuthenticationContext.tsx"
    "frontend/src/services/api.ts"
    "frontend/src/services/websocket.ts"
    "frontend/src/types/user.ts"
    "frontend/src/App.tsx"
    "frontend/src/index.css"
    "frontend/src/index.tsx"
    "package.json"
    ".env"
    ".env.example"
    "ft_transcendenceSubject.pdf"
)


# Copy each file to the target directory, preserving the structure.
for file in "${files[@]}"
do
    if [ -f "$file" ]; then
    {
        filename=$(basename "$file")

        # Check if the file already exists in the backup directory
        if [ -f "$UPLOAD_DIRECTORY/$filename" ]; then
            # If it exists, add a suffix with an underscore
            filename="${filename%.*}_$(date +%s).${filename##*.}"
        fi

        cp "$file" "$UPLOAD_DIRECTORY/$filename"
    }
    else
        echo "File not found: $file"
    fi
done


# Generate the directory structure and save it in the back_up directory.
tree -I ".idea|node_modules|back_up" > "$UPLOAD_DIRECTORY/directory_structure.txt"


echo "Mission accomplished! Files copied into back_up directory and directory structure generated, ER28-0652🥳"
