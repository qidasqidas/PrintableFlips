
const STORAGE_KEY = "flashcard_maker_cards";
const SETTINGS_KEY = "flashcard_maker_settings";


/* =========================================================
   ELEMENTS
========================================================= */

const $ = (id) => document.getElementById(id);

const questionEditor = $("question");
const answerEditor = $("answer");

const saveBtn = $("saveBtn");
const cancelBtn = $("cancelBtn");

const formTitle = $("formTitle");

const cardsContainer = $("cardsContainer");
const emptyState = $("emptyState");
const cardCount = $("cardCount");

const searchInput = $("search");

const printBtn = $("printBtn");
const clearBtn = $("clearBtn");

const printArea = $("printArea");


/* =========================================================
   BATCH IMPORT ELEMENTS
========================================================= */

const batchInput = $("batchInput");
const importBtn = $("importBtn");
const clearImportBtn = $("clearImportBtn");


/* =========================================================
   BATCH GENERAL FORMATTING ELEMENTS
========================================================= */

const batchQuestionPreview =
    $("batchQuestionPreview");

const batchAnswerPreview =
    $("batchAnswerPreview");


/* =========================================================
   SETTINGS
========================================================= */

const defaultSettings = {

    columns: 3,

    rows: 3,

    orientation: "portrait",

    flip: "long",

    horizontal: 0,

    vertical: 0,


    /* -----------------------------------------
       Batch Question General Format
    ----------------------------------------- */

    batchQuestionFormat: {

        bold: true,

        italic: false,

        underline: false,

        script: "normal",

        align: "left",

        fontSize: "32px"
    },


    /* -----------------------------------------
       Batch Answer General Format
    ----------------------------------------- */

    batchAnswerFormat: {

        bold: false,

        italic: false,

        underline: false,

        script: "normal",

        align: "left",

        fontSize: "17px"
    }
};


/* =========================================================
   STORAGE
========================================================= */

function loadCards() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!raw) {
            return [];
        }

        const data =
            JSON.parse(raw);

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "Error loading cards:",
            error
        );

        return [];
    }
}


function saveCards() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cards)
        );

    } catch (error) {

        console.error(
            "Error saving cards:",
            error
        );
    }
}


function loadSettings() {

    try {

        const raw =
            localStorage.getItem(
                SETTINGS_KEY
            );

        if (!raw) {
            return {};
        }

        const data =
            JSON.parse(raw);

        return (
            data &&
            typeof data === "object"
        )
            ? data
            : {};

    } catch (error) {

        console.error(
            "Error loading settings:",
            error
        );

        return {};
    }
}


function saveSettings() {

    try {

        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(settings)
        );

    } catch (error) {

        console.error(
            "Error saving settings:",
            error
        );
    }
}


/* =========================================================
   STATE
========================================================= */

const savedSettings =
    loadSettings();


let cards =
    loadCards();


/*
    Merge normal settings.
*/

let settings = {

    ...defaultSettings,

    ...savedSettings,


    /*
        Merge nested batch Question settings
        separately so missing properties from
        old saved data do not become undefined.
    */

    batchQuestionFormat: {

        ...defaultSettings.batchQuestionFormat,

        ...(savedSettings.batchQuestionFormat || {})
    },


    /*
        Same for batch Answer settings.
    */

    batchAnswerFormat: {

        ...defaultSettings.batchAnswerFormat,

        ...(savedSettings.batchAnswerFormat || {})
    }
};


let editingId = null;

let activeEditor =
    questionEditor;

let savedRange = null;


/* =========================================================
   SELECTION HELPERS
========================================================= */

function nodeInsideEditor(
    node,
    editor
) {

    if (!node || !editor) {
        return false;
    }

    return (
        node === editor ||
        editor.contains(node)
    );
}


function selectionIsInside(
    editor
) {

    const selection =
        window.getSelection();

    if (
        !selection ||
        selection.rangeCount === 0
    ) {
        return false;
    }

    return (
        nodeInsideEditor(
            selection.anchorNode,
            editor
        ) &&
        nodeInsideEditor(
            selection.focusNode,
            editor
        )
    );
}


function saveSelection() {

    if (!activeEditor) {
        return;
    }

    const selection =
        window.getSelection();

    if (
        !selection ||
        selection.rangeCount === 0
    ) {
        return;
    }

    if (
        !selectionIsInside(
            activeEditor
        )
    ) {
        return;
    }

    try {

        savedRange =
            selection
                .getRangeAt(0)
                .cloneRange();

    } catch (error) {

        savedRange = null;
    }
}


function restoreSelection() {

    if (!activeEditor) {
        return false;
    }

    if (!savedRange) {

        try {

            activeEditor.focus();

        } catch (error) {}

        return false;
    }


    if (
        !nodeInsideEditor(
            savedRange.startContainer,
            activeEditor
        ) ||
        !nodeInsideEditor(
            savedRange.endContainer,
            activeEditor
        )
    ) {
        return false;
    }


    try {

        activeEditor.focus();

        const selection =
            window.getSelection();

        selection.removeAllRanges();

        selection.addRange(
            savedRange
        );

        return true;

    } catch (error) {

        return false;
    }
}


/* =========================================================
   MANUAL EDITOR SYSTEM
   ---------------------------------------------------------
   This is completely separate from the Batch
   General Formatting system below.
========================================================= */

function setActiveEditor(
    editor
) {

    activeEditor =
        editor;

    saveSelection();
}


function executeCommand(
    command,
    value = null
) {

    if (!activeEditor) {
        return;
    }


    restoreSelection();


    try {

        document.execCommand(
            command,
            false,
            value
        );

    } catch (error) {

        console.error(
            "Formatting error:",
            error
        );
    }


    saveSelection();


    try {

        activeEditor.focus();

    } catch (error) {}
}


function clearFormatting() {

    if (!activeEditor) {
        return;
    }


    restoreSelection();


    try {

        document.execCommand(
            "removeFormat",
            false,
            null
        );

    } catch (error) {

        console.error(
            "Clear formatting error:",
            error
        );
    }


    saveSelection();
}


/* =========================================================
   EDITORS
========================================================= */

function setupEditor(
    editor
) {

    editor.addEventListener(
        "focus",
        () => {

            setActiveEditor(
                editor
            );
        }
    );


    editor.addEventListener(
        "mouseup",
        () => {

            setActiveEditor(
                editor
            );
        }
    );


    editor.addEventListener(
        "keyup",
        () => {

            setActiveEditor(
                editor
            );
        }
    );


    editor.addEventListener(
        "blur",
        () => {

            saveSelection();
        }
    );
}


/* =========================================================
   MANUAL TOOLBARS
========================================================= */

function setupToolbars() {

    document
        .querySelectorAll(
            ".editor-toolbar"
        )
        .forEach((toolbar) => {

            const editor =
                $(
                    toolbar.dataset.editor
                );


            /*
                Formatting buttons.
            */

            toolbar
                .querySelectorAll(
                    "button[data-command]"
                )
                .forEach((button) => {

                    button.addEventListener(
                        "mousedown",
                        (event) => {

                            event.preventDefault();

                            setActiveEditor(
                                editor
                            );

                            executeCommand(
                                button.dataset.command
                            );
                        }
                    );
                });


            /*
                Font size.
            */

            const sizeSelect =
                toolbar.querySelector(
                    ".font-size"
                );


            if (sizeSelect) {

                sizeSelect.addEventListener(
                    "mousedown",
                    () => {

                        setActiveEditor(
                            editor
                        );

                        saveSelection();
                    }
                );


                sizeSelect.addEventListener(
                    "change",
                    () => {

                        setActiveEditor(
                            editor
                        );


                        const value =
                            sizeSelect.value;


                        if (value) {

                            executeCommand(
                                "fontSize",
                                value
                            );
                        }


                        sizeSelect.value =
                            "";
                    }
                );
            }


            /*
                Clear formatting.
            */

            const clearButton =
                toolbar.querySelector(
                    ".clear-format"
                );


            if (clearButton) {

                clearButton.addEventListener(
                    "mousedown",
                    (event) => {

                        event.preventDefault();

                        setActiveEditor(
                            editor
                        );

                        clearFormatting();
                    }
                );
            }

        });
}


/* =========================================================
   FORM RESET
========================================================= */

function resetForm() {

    questionEditor.innerHTML =
        "";

    answerEditor.innerHTML =
        "";

    editingId =
        null;


    formTitle.textContent =
        "Add Flashcard";


    saveBtn.textContent =
        "Add Card";


    cancelBtn.hidden =
        true;


    activeEditor =
        questionEditor;


    savedRange =
        null;


    questionEditor.focus();
}


/* =========================================================
   TEXT HELPERS
========================================================= */

function plainText(
    html
) {

    const temp =
        document.createElement(
            "div"
        );


    temp.innerHTML =
        html || "";


    return (
        temp.textContent || ""
    )
        .replace(
            /\u00a0/g,
            " "
        )
        .trim();
}


function escapeAttribute(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        );
}


/* =========================================================
   BATCH GENERAL FORMAT SYSTEM
   ---------------------------------------------------------
   IMPORTANT:
   This system NEVER uses:
   - contenteditable
   - selectionchange
   - execCommand
   - saved ranges

   It only changes settings and re-renders cards.
   Therefore it cannot form an editor event loop.
========================================================= */


/* ---------------------------------------------------------
   Get a Batch Format
--------------------------------------------------------- */

function getBatchFormat(
    type
) {

    if (
        type === "question"
    ) {

        return settings.batchQuestionFormat;

    }

    return settings.batchAnswerFormat;
}


/* ---------------------------------------------------------
   Build inline CSS for a Batch Format
--------------------------------------------------------- */

function getBatchFormatStyle(
    format
) {

    let style = "";


    style +=
        `font-size:${format.fontSize};`;


    style +=
        `font-weight:${
            format.bold
                ? "700"
                : "400"
        };`;


    style +=
        `font-style:${
            format.italic
                ? "italic"
                : "normal"
        };`;


    style +=
        `text-decoration:${
            format.underline
                ? "underline"
                : "none"
        };`;


    style +=
        `text-align:${format.align};`;


    style +=
        "line-height:1.3;";


    return style;
}


/* ---------------------------------------------------------
   Apply Batch Format to an imported card
--------------------------------------------------------- */

function formatBatchContent(
    html,
    type
) {

    const format =
        getBatchFormat(
            type
        );


    const baseStyle =
        getBatchFormatStyle(
            format
        );


    let content =
        html || "";


    /*
        Super/subscript is handled using
        an inline span so vertical-align
        actually works on the text.
    */

    if (
        format.script === "super"
    ) {

        content = `
            <span
                style="
                    vertical-align:super;
                    font-size:0.7em;
                "
            >
                ${content}
            </span>
        `;

    } else if (
        format.script === "sub"
    ) {

        content = `
            <span
                style="
                    vertical-align:sub;
                    font-size:0.7em;
                "
            >
                ${content}
            </span>
        `;
    }


    return `
        <div
            class="batch-format-wrapper"
            style="${baseStyle}"
        >
            ${content}
        </div>
    `;
}


/* ---------------------------------------------------------
   Update active appearance of Batch toolbar
--------------------------------------------------------- */

function updateBatchFormatToolbar(
    type
) {

    const format =
        getBatchFormat(
            type
        );


    const toolbar =
        document.querySelector(
            `.batch-format-toolbar[data-batch-format="${type}"]`
        );


    if (!toolbar) {
        return;
    }


    toolbar
        .querySelectorAll(
            "button[data-format-command]"
        )
        .forEach((button) => {

            const command =
                button.dataset.formatCommand;


            let active =
                false;


            if (
                command === "bold"
            ) {

                active =
                    format.bold;

            } else if (
                command === "italic"
            ) {

                active =
                    format.italic;

            } else if (
                command === "underline"
            ) {

                active =
                    format.underline;

            } else if (
                command === "superscript"
            ) {

                active =
                    format.script ===
                    "super";

            } else if (
                command === "subscript"
            ) {

                active =
                    format.script ===
                    "sub";

            } else if (
                command === "align-left"
            ) {

                active =
                    format.align ===
                    "left";

            } else if (
                command === "align-center"
            ) {

                active =
                    format.align ===
                    "center";

            } else if (
                command === "align-right"
            ) {

                active =
                    format.align ===
                    "right";
            }


            button.classList.toggle(
                "format-preset-active",
                active
            );


            button.setAttribute(
                "aria-pressed",
                active
                    ? "true"
                    : "false"
            );
        });


    const sizeSelect =
        toolbar.querySelector(
            ".batch-font-size"
        );


    if (sizeSelect) {

        sizeSelect.value =
            format.fontSize;
    }
}


/* ---------------------------------------------------------
   Update Batch Preview
--------------------------------------------------------- */

function updateBatchFormatPreview(
    type
) {

    const format =
        getBatchFormat(
            type
        );


    const preview =
        type === "question"
            ? batchQuestionPreview
            : batchAnswerPreview;


    if (!preview) {
        return;
    }


    preview.style.fontSize =
        format.fontSize;


    preview.style.fontWeight =
        format.bold
            ? "700"
            : "400";


    preview.style.fontStyle =
        format.italic
            ? "italic"
            : "normal";


    preview.style.textDecoration =
        format.underline
            ? "underline"
            : "none";


    preview.style.textAlign =
        format.align;


    preview.style.lineHeight =
        "1.3";


    /*
        Reset these before deciding
        whether to apply super/sub.
    */

    preview.style.verticalAlign =
        "baseline";


    preview.style.display =
        "block";


    if (
        format.script === "super"
    ) {

        preview.style.fontSize =
            "0.7em";

        preview.style.verticalAlign =
            "super";

    } else if (
        format.script === "sub"
    ) {

        preview.style.fontSize =
            "0.7em";

        preview.style.verticalAlign =
            "sub";
    }


    updateBatchFormatToolbar(
        type
    );
}


/* ---------------------------------------------------------
   Change Batch General Format
--------------------------------------------------------- */

function changeBatchFormat(
    type,
    command
) {

    const format =
        getBatchFormat(
            type
        );


    if (
        command === "bold"
    ) {

        format.bold =
            !format.bold;


    } else if (
        command === "italic"
    ) {

        format.italic =
            !format.italic;


    } else if (
        command === "underline"
    ) {

        format.underline =
            !format.underline;


    } else if (
        command === "superscript"
    ) {

        format.script =
            format.script === "super"
                ? "normal"
                : "super";


    } else if (
        command === "subscript"
    ) {

        format.script =
            format.script === "sub"
                ? "normal"
                : "sub";


    } else if (
        command === "align-left"
    ) {

        format.align =
            "left";


    } else if (
        command === "align-center"
    ) {

        format.align =
            "center";


    } else if (
        command === "align-right"
    ) {

        format.align =
            "right";


    } else if (
        command === "clear"
    ) {

        if (
            type === "question"
        ) {

            settings.batchQuestionFormat = {
                ...defaultSettings.batchQuestionFormat
            };

        } else {

            settings.batchAnswerFormat = {
                ...defaultSettings.batchAnswerFormat
            };
        }
    }


    saveSettings();


    updateBatchFormatPreview(
        type
    );


    /*
        Re-render all cards so existing
        batch cards immediately change.
    */

    renderCards(
        searchInput.value
    );
}


/* ---------------------------------------------------------
   Setup Batch General Formatting Toolbars
--------------------------------------------------------- */

function setupBatchFormatToolbars() {

    document
        .querySelectorAll(
            ".batch-format-toolbar"
        )
        .forEach((toolbar) => {

            const type =
                toolbar.dataset.batchFormat;


            /*
                Bold / italic / underline /
                alignment / scripts / clear.
            */

            toolbar
                .querySelectorAll(
                    "button[data-format-command]"
                )
                .forEach((button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            changeBatchFormat(
                                type,
                                button.dataset.formatCommand
                            );
                        }
                    );
                });


            /*
                Font size.
            */

            const sizeSelect =
                toolbar.querySelector(
                    ".batch-font-size"
                );


            if (sizeSelect) {

                sizeSelect.addEventListener(
                    "change",
                    () => {

                        const format =
                            getBatchFormat(
                                type
                            );


                        if (
                            sizeSelect.value
                        ) {

                            format.fontSize =
                                sizeSelect.value;


                            saveSettings();


                            updateBatchFormatPreview(
                                type
                            );


                            renderCards(
                                searchInput.value
                            );
                        }
                    }
                );
            }
        });


    updateBatchFormatPreview(
        "question"
    );


    updateBatchFormatPreview(
        "answer"
    );
}


/* =========================================================
   BATCH IMPORT TEXT
========================================================= */


/*
    Batch cards use this format:

    ### CARD 1
    QUESTION:
    Question here

    ANSWER:
    Answer here

    ### END
*/


function textToHTML(
    text
) {

    const value =
        String(text || "");


    return value

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /\r?\n/g,
            "<br>"
        );
}


/* ---------------------------------------------------------
   Create Imported Card
--------------------------------------------------------- */

function createImportedCard(
    question,
    answer
) {

    return {

        id:
            `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 9)}`,

        /*
            This is what distinguishes
            imported cards from manually-created
            cards.

            The general Batch Formatting toolbar
            is applied only when source === "batch".
        */

        source: "batch",

        question:
            textToHTML(
                question.trim()
            ),

        answer:
            textToHTML(
                answer.trim()
            )
    };
}


/* ---------------------------------------------------------
   Parse Batch Cards
--------------------------------------------------------- */

function parseBatchCards(
    text
) {

    const input =
        String(text || "")
            .replace(
                /\r\n/g,
                "\n"
            )
            .trim();


    if (!input) {
        return [];
    }


    const importedCards =
        [];


    const pattern =
        /###\s*CARD(?:\s+\d+)?\s*\n\s*QUESTION:\s*\n?([\s\S]*?)\n\s*ANSWER:\s*\n?([\s\S]*?)\n\s*###\s*END/gi;


    let match;


    while (
        (match =
            pattern.exec(input)) !== null
    ) {

        const question =
            match[1].trim();


        const answer =
            match[2].trim();


        if (
            question &&
            answer
        ) {

            importedCards.push(
                createImportedCard(
                    question,
                    answer
                )
            );
        }
    }


    return importedCards;
}


/* ---------------------------------------------------------
   Import Batch Cards
--------------------------------------------------------- */

function importBatchCards() {

    if (!batchInput) {
        return;
    }


    const text =
        batchInput.value.trim();


    if (!text) {

        alert(
            "Paste your cards into the Batch Import box first."
        );

        batchInput.focus();

        return;
    }


    const importedCards =
        parseBatchCards(
            text
        );


    if (
        importedCards.length === 0
    ) {

        alert(
            "No cards were detected.\n\n" +
            "Use this format:\n\n" +
            "### CARD 1\n" +
            "QUESTION:\n" +
            "Your question\n\n" +
            "ANSWER:\n" +
            "Your answer\n\n" +
            "### END"
        );

        return;
    }


    cards.push(
        ...importedCards
    );


    saveCards();


    renderCards(
        searchInput.value
    );


    batchInput.value =
        "";


    alert(
        `${importedCards.length} card${
            importedCards.length === 1
                ? ""
                : "s"
        } imported successfully.`
    );
}


/* =========================================================
   CARD RENDERING
========================================================= */

function renderCards(
    filter = ""
) {

    const query =
        filter
            .trim()
            .toLowerCase();


    const visibleCards =
        cards.filter(
            (card) => {

                const question =
                    plainText(
                        card.question
                    ).toLowerCase();


                const answer =
                    plainText(
                        card.answer
                    ).toLowerCase();


                return (
                    !query ||
                    question.includes(query) ||
                    answer.includes(query)
                );
            }
        );


    cardsContainer.innerHTML =
        "";


    emptyState.hidden =
        visibleCards.length > 0;


    visibleCards.forEach(
        (card) => {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "card-item";


            /*
                Batch cards use the global
                Batch Question/Answer format.

                Manual cards use their own
                stored/manual content.
            */

            const displayedQuestion =
                card.source === "batch"
                    ? formatBatchContent(
                        card.question,
                        "question"
                    )
                    : card.question || "";


            const displayedAnswer =
                card.source === "batch"
                    ? formatBatchContent(
                        card.answer,
                        "answer"
                    )
                    : card.answer || "";


            article.innerHTML = `

                <div class="card-content">

                    <div class="card-label">
                        Question
                    </div>

                    <div class="flashcard-question">

                        ${displayedQuestion}

                    </div>


                    <div class="card-label">
                        Answer
                    </div>

                    <div class="flashcard-answer">

                        ${displayedAnswer}

                    </div>

                </div>


                <div class="card-actions">

                    <button
                        type="button"
                        class="secondary edit-card"
                        data-id="${escapeAttribute(
                            card.id
                        )}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="danger delete-card"
                        data-id="${escapeAttribute(
                            card.id
                        )}"
                    >
                        Delete
                    </button>

                </div>
            `;


            cardsContainer.appendChild(
                article
            );
        }
    );


    cardCount.textContent =
        `${cards.length} card${
            cards.length === 1
                ? ""
                : "s"
        }`;
}


/* =========================================================
   SAVE CARD
========================================================= */

function saveCurrentCard() {

    const question =
        questionEditor.innerHTML.trim();


    const answer =
        answerEditor.innerHTML.trim();


    if (
        !plainText(question)
    ) {

        alert(
            "Please enter a question."
        );

        questionEditor.focus();

        return;
    }


    if (
        !plainText(answer)
    ) {

        alert(
            "Please enter an answer."
        );

        answerEditor.focus();

        return;
    }


    if (editingId) {

        const index =
            cards.findIndex(
                (card) =>
                    card.id ===
                    editingId
            );


        if (index !== -1) {

            cards[index] = {

                ...cards[index],

                question,

                answer
            };
        }

    } else {

        cards.push({

            id:
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,

            /*
                Manual cards do NOT get
                source: "batch".
            */

            question,

            answer
        });
    }


    saveCards();


    renderCards(
        searchInput.value
    );


    resetForm();
}


/* =========================================================
   EDIT CARD
========================================================= */

function startEdit(
    id
) {

    const card =
        cards.find(
            (item) =>
                item.id === id
        );


    if (!card) {
        return;
    }


    editingId =
        id;


    questionEditor.innerHTML =
        card.question || "";


    answerEditor.innerHTML =
        card.answer || "";


    formTitle.textContent =
        "Edit Flashcard";


    saveBtn.textContent =
        "Update Card";


    cancelBtn.hidden =
        false;


    activeEditor =
        questionEditor;


    questionEditor.focus();


    saveSelection();


    window.scrollTo({

        top: 0,

        behavior: "smooth"
    });
}


/* =========================================================
   DELETE CARD
========================================================= */

function deleteCard(
    id
) {

    if (
        !confirm(
            "Delete this flashcard?"
        )
    ) {
        return;
    }


    cards =
        cards.filter(
            (card) =>
                card.id !== id
        );


    saveCards();


    if (
        editingId === id
    ) {

        resetForm();
    }


    renderCards(
        searchInput.value
    );
}


/* =========================================================
   CLEAR SESSION
========================================================= */

function clearSession() {

    if (
        cards.length === 0
    ) {

        return;
    }


    if (
        !confirm(
            "Clear all flashcards from this session?"
        )
    ) {

        return;
    }


    cards =
        [];


    saveCards();


    resetForm();


    renderCards(
        searchInput.value
    );
}


/* =========================================================
   PRINT SETTINGS
========================================================= */

function syncSettings() {

    settings.columns =
        Number(
            $("columns").value
        );


    settings.rows =
        Number(
            $("rows").value
        );


    settings.orientation =
        $("orientation").value;


    settings.flip =
        $("flip").value;


    settings.horizontal =
        Number(
            $("horizontal").value
        );


    settings.vertical =
        Number(
            $("vertical").value
        );


    $("horizontalValue").textContent =
        `${settings.horizontal} mm`;


    $("verticalValue").textContent =
        `${settings.vertical} mm`;


    saveSettings();
}


function loadSettingsIntoControls() {

    $("columns").value =
        String(
            settings.columns
        );


    $("rows").value =
        String(
            settings.rows
        );


    $("orientation").value =
        settings.orientation;


    $("flip").value =
        settings.flip;


    $("horizontal").value =
        String(
            settings.horizontal
        );


    $("vertical").value =
        String(
            settings.vertical
        );


    $("horizontalValue").textContent =
        `${settings.horizontal} mm`;


    $("verticalValue").textContent =
        `${settings.vertical} mm`;
}


/* =========================================================
   DUPLEX ORDER
========================================================= */

function transformBackPageOrder(
    items,
    columns,
    rows,
    orientation,
    flip
) {

    const result =
        new Array(
            items.length
        );


    const horizontalFlip =
        (
            orientation === "portrait" &&
            flip === "long"
        ) ||
        (
            orientation === "landscape" &&
            flip === "short"
        );


    const verticalFlip =
        !horizontalFlip;


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            const targetIndex =
                row * columns +
                column;


            const sourceRow =
                verticalFlip
                    ? rows - 1 - row
                    : row;


            const sourceColumn =
                horizontalFlip
                    ? columns - 1 - column
                    : column;


            const sourceIndex =
                sourceRow * columns +
                sourceColumn;


            result[targetIndex] =
                items[sourceIndex];
        }
    }


    return result;
}


/* =========================================================
   PRINT PAGE
========================================================= */

function makePrintPage(
    items,
    className,
    columns,
    rows
) {

    const page =
        document.createElement(
            "section"
        );


    page.className =
        `print-page ${className}`;


    page.style.setProperty(
        "--columns",
        columns
    );


    page.style.setProperty(
        "--rows",
        rows
    );


    items.forEach(
        (item) => {

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "print-card";


            if (item) {

                const content =
                    document.createElement(
                        "div"
                    );


                content.className =
                    "print-card-content";


                /*
                    Apply Batch General
                    Formatting when printing.

                    Manual cards are printed normally.
                */

                if (
                    className.includes(
                        "front-page"
                    )
                ) {

                    content.innerHTML =
                        item.source === "batch"

                            ? formatBatchContent(
                                item.question,
                                "question"
                            )

                            : item.question ||
                                "";

                } else {

                    content.innerHTML =
                        item.source === "batch"

                            ? formatBatchContent(
                                item.answer,
                                "answer"
                            )

                            : item.answer ||
                                "";
                }


                cell.appendChild(
                    content
                );
            }


            page.appendChild(
                cell
            );
        }
    );


    return page;
}


/* =========================================================
   BUILD PRINT PAGES
========================================================= */

function buildPrintPages() {

    if (
        cards.length === 0
    ) {

        alert(
            "There are no flashcards to print."
        );

        return;
    }


    syncSettings();


    printArea.innerHTML =
        "";


    const columns =
        settings.columns;


    const rows =
        settings.rows;


    const perPage =
        columns * rows;


    const orientation =
        settings.orientation;


    const paperWidth =
        orientation === "portrait"

            ? "210mm"

            : "297mm";


    const paperHeight =
        orientation === "portrait"

            ? "297mm"

            : "210mm";


    printArea.style.setProperty(
        "--paper-width",
        paperWidth
    );


    printArea.style.setProperty(
        "--paper-height",
        paperHeight
    );


    printArea.style.setProperty(
        "--columns",
        columns
    );


    printArea.style.setProperty(
        "--rows",
        rows
    );


    printArea.style.setProperty(
        "--back-x",
        `${settings.horizontal}mm`
    );


    printArea.style.setProperty(
        "--back-y",
        `${settings.vertical}mm`
    );


    /*
        Remove previous dynamic print CSS.
    */

    const oldStyle =
        document.getElementById(
            "dynamic-print-style"
        );


    if (oldStyle) {

        oldStyle.remove();
    }


    const printStyle =
        document.createElement(
            "style"
        );


    printStyle.id =
        "dynamic-print-style";


    printStyle.textContent =

        `@page {
            size: A4 ${orientation};
            margin: 0;
        }`;


    document.head.appendChild(
        printStyle
    );


    /*
        Create front and back sheets.
    */

    for (
        let start = 0;

        start < cards.length;

        start += perPage
    ) {

        const chunk =
            cards.slice(
                start,
                start + perPage
            );


        /*
            Fill unused cells.
        */

        while (
            chunk.length <
            perPage
        ) {

            chunk.push(
                null
            );
        }


        const backChunk =
            transformBackPageOrder(

                [...chunk],

                columns,

                rows,

                orientation,

                settings.flip
            );


        printArea.appendChild(

            makePrintPage(

                chunk,

                "front-page",

                columns,

                rows
            )
        );


        printArea.appendChild(

            makePrintPage(

                backChunk,

                "back-page",

                columns,

                rows
            )
        );
    }


    /*
        One print call.
    */

    requestAnimationFrame(
        () => {

            window.print();

        }
    );
}


/* =========================================================
   EVENT LISTENERS
========================================================= */


/* ---------------------------------------------------------
   Main buttons
--------------------------------------------------------- */

saveBtn.addEventListener(
    "click",
    saveCurrentCard
);


cancelBtn.addEventListener(
    "click",
    resetForm
);


clearBtn.addEventListener(
    "click",
    clearSession
);


printBtn.addEventListener(
    "click",
    buildPrintPages
);


/* ---------------------------------------------------------
   Search
--------------------------------------------------------- */

searchInput.addEventListener(
    "input",
    () => {

        renderCards(
            searchInput.value
        );
    }
);


/* =========================================================
   CARD BUTTONS
========================================================= */

cardsContainer.addEventListener(
    "click",
    (event) => {

        const editButton =
            event.target.closest(
                ".edit-card"
            );


        const deleteButton =
            event.target.closest(
                ".delete-card"
            );


        if (editButton) {

            startEdit(
                editButton.dataset.id
            );

            return;
        }


        if (deleteButton) {

            deleteCard(
                deleteButton.dataset.id
            );
        }
    }
);


/* =========================================================
   BATCH IMPORT BUTTONS
========================================================= */

if (importBtn) {

    importBtn.addEventListener(
        "click",
        importBatchCards
    );
}


if (clearImportBtn) {

    clearImportBtn.addEventListener(
        "click",
        () => {

            if (batchInput) {

                batchInput.value =
                    "";

                batchInput.focus();
            }
        }
    );
}


/* =========================================================
   BATCH GENERAL FORMAT TOOLBARS
========================================================= */

setupBatchFormatToolbars();


/* =========================================================
   PRINT SETTINGS EVENTS
========================================================= */

[
    "columns",

    "rows",

    "orientation",

    "flip",

    "horizontal",

    "vertical"

].forEach(
    (id) => {

        const control =
            $(id);


        if (!control) {
            return;
        }


        control.addEventListener(
            "change",
            syncSettings
        );


        control.addEventListener(
            "input",
            syncSettings
        );
    }
);


/* =========================================================
   INITIALISE
========================================================= */

setupEditor(
    questionEditor
);


setupEditor(
    answerEditor
);


setupToolbars();


loadSettingsIntoControls();


renderCards();
